import Foundation
import UIKit
import CoreLocation

final class WebSocketManager: NSObject {
    static let shared = WebSocketManager()

    private var webSocket: URLSessionWebSocketTask?
    private var isConnected = false
    private var lastURLString: String?
    private var topics = Set<String>()
    private let defaultTopic = "incidents"

    var onIncidentReceived: ((Incident) -> Void)?
    var onIncidentRemoved: ((String) -> Void)?
    var onConnectionStatusChanged: ((Bool) -> Void)?

    private override init() { super.init() }

    func connect(urlString: String = "ws://localhost:3000/incidents", topics initialTopics: [String]? = nil) {
        guard let url = URL(string: urlString) else { return }
        lastURLString = urlString
        if let initialTopics, !initialTopics.isEmpty {
            topics = Set(initialTopics)
        } else {
            topics = [defaultTopic]
        }
        let session = URLSession(configuration: .default, delegate: self, delegateQueue: nil)
        webSocket = session.webSocketTask(with: url)
        webSocket?.resume()
        receiveMessage()
    }

    func disconnect() {
        webSocket?.cancel(with: .normalClosure, reason: nil)
        webSocket = nil
        isConnected = false
        onConnectionStatusChanged?(false)
    }

    func subscribe(_ topic: String) {
        guard isConnected else {
            topics.insert(topic)
            return
        }
        topics.insert(topic)
        sendJSON(["type": "subscribe", "topic": topic])
    }

    func unsubscribe(_ topic: String) {
        guard isConnected else {
            topics.remove(topic)
            return
        }
        topics.remove(topic)
        sendJSON(["type": "unsubscribe", "topic": topic])
    }

    private func resubscribeAll() {
        for t in topics {
            sendJSON(["type": "subscribe", "topic": t])
        }
    }

    func sendIncident(_ incident: Incident, topic: String? = nil) {
        guard isConnected else { return }
        let payload: [String: Any] = [
            "type": "new_incident",
            "data": [
                "type": incident.type.rawValue.lowercased(),
                "severity": incident.severity.rawValue.lowercased(),
                "lat": incident.coordinate.latitude,
                "lon": incident.coordinate.longitude,
                "description": incident.description ?? "",
                "image": incident.image?.jpegData(compressionQuality: 0.8)?.base64EncodedString() ?? ""
            ],
            "userId": "1" // Simple user ID for now
        ]
        sendJSON(payload)
    }

    func removeIncident(id: String, topic: String? = nil) {
        guard isConnected else { return }
        let payload: [String: Any] = [
            "type": "remove_incident",
            "data": ["id": id],
            "userId": "1"
        ]
        sendJSON(payload)
    }

    private func sendJSON(_ dict: [String: Any]) {
        do {
            let data = try JSONSerialization.data(withJSONObject: dict, options: [])
            webSocket?.send(.data(data)) { error in
                if let error = error {
                    print("WebSocket send error:", error)
                }
            }
        } catch {
            print("JSON serialize error:", error)
        }
    }

    private func receiveMessage() {
        webSocket?.receive { [weak self] result in
            guard let self else { return }
            switch result {
            case .success(let message):
                self.handleMessage(message)
                self.receiveMessage()
            case .failure(let error):
                print("WebSocket receive error:", error)
                self.isConnected = false
                self.onConnectionStatusChanged?(false)
            }
        }
    }

    private func handleMessage(_ message: URLSessionWebSocketTask.Message) {
        switch message {
        case .data(let data):
            do {
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    handleJSONMessage(json)
                }
            } catch {
                print("Error parsing JSON:", error)
            }
        case .string(let string):
            print("Received string:", string)
            if let data = string.data(using: .utf8) {
                do {
                    if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                        handleJSONMessage(json)
                    }
                } catch {
                    print("Error parsing string JSON:", error)
                }
            }
        @unknown default:
            break
        }
    }

    private func handleJSONMessage(_ json: [String: Any]) {
        guard let type = json["type"] as? String else { return }
        switch type {
        case "incident_created":
            if let data = json["data"] as? [String: Any],
               let incident = parseIncidentFromBackend(data) {
                DispatchQueue.main.async {
                    self.onIncidentReceived?(incident)
                }
            }
        case "incident_removed":
            if let data = json["data"] as? [String: Any],
               let id = data["id"] as? String {
                DispatchQueue.main.async {
                    self.onIncidentRemoved?(id)
                }
            }
        case "all_incidents":
            if let incidents = json["data"] as? [[String: Any]] {
                for incidentData in incidents {
                    if let incident = parseIncidentFromBackend(incidentData) {
                        DispatchQueue.main.async {
                            self.onIncidentReceived?(incident)
                        }
                    }
                }
            }
        default:
            break
        }
    }

    private func parseIncident(from data: [String: Any]) -> Incident? {
        guard let typeString = data["type"] as? String,
              let severityString = data["severity"] as? String,
              let lat = data["lat"] as? Double,
              let lon = data["lon"] as? Double else {
            return nil
        }
        let type = Incident.IncidentType(rawValue: typeString) ?? .crash
        let severity = Incident.Severity(rawValue: severityString) ?? .medium
        let coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lon)
        let description = data["description"] as? String
        var image: UIImage?
        if let imageString = data["image"] as? String,
           let imageData = Data(base64Encoded: imageString) {
            image = UIImage(data: imageData)
        }
        return Incident(
            type: type,
            severity: severity,
            coordinate: coordinate,
            description: description,
            image: image
        )
    }
    
    private func parseIncidentFromBackend(_ data: [String: Any]) -> Incident? {
        guard let typeRaw = data["type"] as? String,
              let severityRaw = data["severity"] as? String else {
            return nil
        }
        // type/severity backend -> iOS enum dönüştürme
        let type: Incident.IncidentType
        switch typeRaw.lowercased() {
        case "crash": type = .crash
        case "slowdown": type = .slowdown
        case "construction": type = .construction
        case "laneclosure": type = .laneClosure
        case "lane_closure": type = .laneClosure
        case "lane closure": type = .laneClosure
        case "objectonroad": type = .objectOnRoad
        case "object_on_road": type = .objectOnRoad
        case "object on road": type = .objectOnRoad
        default: type = .crash
        }
        let severity: Incident.Severity
        switch severityRaw.lowercased() {
        case "low": severity = .low
        case "high": severity = .high
        default: severity = .medium
        }
        // latitude/longitude hem String hem Double gelebilir
        func parseNumber(_ v: Any?) -> Double? {
            if let d = v as? Double { return d }
            if let s = v as? String, let d = Double(s) { return d }
            if let n = v as? NSNumber { return n.doubleValue }
            return nil
        }
        guard let lat = parseNumber(data["latitude"]), let lon = parseNumber(data["longitude"]) else {
            return nil
        }
        let coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lon)
        let description = data["description"] as? String
        var image: UIImage?
        if let imageString = data["image"] as? String,
           let imageData = Data(base64Encoded: imageString) {
            image = UIImage(data: imageData)
        }
        
        // Create incident with backend ID if available
        if let id = data["id"] as? String {
            return Incident(
                id: id,
                type: type,
                severity: severity,
                coordinate: coordinate,
                description: description,
                image: image,
                timestamp: Date(),
                reporterCount: 1
            )
        } else {
            return Incident(
                type: type,
                severity: severity,
                coordinate: coordinate,
                description: description,
                image: image
            )
        }
    }
}

extension WebSocketManager: URLSessionWebSocketDelegate {
    func urlSession(_ session: URLSession,
                    webSocketTask: URLSessionWebSocketTask,
                    didOpenWithProtocol protocol: String?) {
        isConnected = true
        onConnectionStatusChanged?(true)
        resubscribeAll()
    }

    func urlSession(_ session: URLSession,
                    webSocketTask: URLSessionWebSocketTask,
                    didCloseWith closeCode: URLSessionWebSocketTask.CloseCode,
                    reason: Data?) {
        isConnected = false
        onConnectionStatusChanged?(false)
    }
}
