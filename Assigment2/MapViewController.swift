import UIKit
import MapboxMaps
import CoreLocation

final class MapViewController: UIViewController, IncidentFormDelegate {
    private var mapView: MapView!
    private var pointManager: PointAnnotationManager!
    private var incidents: [Incident] = []
    private var incidentAnnotations: [String: PointAnnotation] = [:]

    override func viewDidLoad() {
        super.viewDidLoad()

        let camera = CameraOptions(
            center: CLLocationCoordinate2D(latitude: 39.9208, longitude: 32.8541),
            zoom: 12
        )

        let initOptions = MapInitOptions(
            cameraOptions: camera,
            styleURI: .streets
        )

        mapView = MapView(frame: view.bounds, mapInitOptions: initOptions)
        mapView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(mapView)

        pointManager = mapView.annotations.makePointAnnotationManager()

        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleMapTap(_:)))
        mapView.addGestureRecognizer(tapGesture)

        setupToolbar()
        setupWebSocket()
    }
    
    private func setupWebSocket() {
        let wsManager = WebSocketManager.shared
        wsManager.onIncidentReceived = { [weak self] incident in
            DispatchQueue.main.async {
                self?.addIncidentFromWebSocket(incident)
            }
        }
        wsManager.onIncidentRemoved = { [weak self] incidentId in
            DispatchQueue.main.async {
                self?.removeIncidentFromWebSocket(incidentId)
            }
        }
        wsManager.connect()
    }
    
    private func addIncidentFromWebSocket(_ incident: Incident) {
        // Check if incident already exists
        if incidents.contains(where: { $0.id == incident.id }) {
            return
        }
        
        incidents.append(incident)
        
        var annotation = PointAnnotation(coordinate: incident.coordinate)
        let emoji = getEmojiForType(incident.type)
        let color = getColorForSeverity(incident.severity)
        
        annotation.textField = "\(emoji) \(incident.type.rawValue)"
        annotation.textSize = 14
        annotation.textColor = StyleColor(color)
        annotation.textHaloColor = StyleColor(.white)
        annotation.textHaloWidth = 2
        annotation.iconSize = 1.5
        
        pointManager.annotations.append(annotation)
        incidentAnnotations[incident.id] = annotation
        
        updateToolbar()
    }
    
    private func removeIncidentFromWebSocket(_ incidentId: String) {
        incidents.removeAll { $0.id == incidentId }
        if let annotation = incidentAnnotations[incidentId] {
            pointManager.annotations.removeAll { $0.id == annotation.id }
            incidentAnnotations.removeValue(forKey: incidentId)
        }
        updateToolbar()
    }

    @objc private func handleMapTap(_ gesture: UITapGestureRecognizer) {
        let screenPoint = gesture.location(in: mapView)
        let coordinate = mapView.mapboxMap.coordinate(for: screenPoint)

        let form = IncidentFormViewController(coordinate: coordinate)
        form.delegate = self
        let nav = UINavigationController(rootViewController: form)
        present(nav, animated: true)
    }

    func incidentFormDidSubmit(_ incident: Incident) {
        // Olayı sadece backend'e gönder; eklemeyi server'dan gelen broadcast ile yap
        WebSocketManager.shared.sendIncident(incident)
        
        let camera = CameraOptions(
            center: incident.coordinate,
            zoom: 15
        )
        mapView.mapboxMap.setCamera(to: camera)
        
        showSuccessMessage("Incident reported successfully!")
    }

    func incidentFormDidCancel() {
        
    }
    
    
    private func showSuccessMessage(_ message: String) {
        let alert = UIAlertController(title: "Success", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    private func showIncidentDetails(_ incident: Incident) {
        let alert = UIAlertController(title: "\(getEmojiForType(incident.type)) Incident Details", message: nil, preferredStyle: .actionSheet)
        
        let severityEmoji = getSeverityEmoji(incident.severity)
        let details = """
        🏷️ Type: \(incident.type.rawValue)
        \(severityEmoji) Severity: \(incident.severity.rawValue)
        📝 Description: \(incident.description ?? "No description")
        🕐 Reported: \(incident.timestamp.formatted())
        👥 Reporters: \(incident.reporterCount)
        """
        
        alert.message = details
        
        alert.addAction(UIAlertAction(title: "🗑️ Remove Incident", style: .destructive) { [weak self] _ in
            self?.removeIncident(incident)
        })
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        
        present(alert, animated: true)
    }
    
    private func removeIncident(_ incident: Incident) {
        // Backend'e bildir
        WebSocketManager.shared.removeIncident(id: incident.id)
        
        // Yerelde de kaldır (idempotent)
        incidents.removeAll { $0.id == incident.id }
        if let annotation = incidentAnnotations[incident.id] {
            pointManager.annotations.removeAll { $0.id == annotation.id }
            incidentAnnotations.removeValue(forKey: incident.id)
        }
        updateToolbar()
        showSuccessMessage("Incident removed successfully!")
    }
    
    private func setupToolbar() {
        // Modern floating toolbar
        let containerView = UIView()
        containerView.translatesAutoresizingMaskIntoConstraints = false
        containerView.backgroundColor = UIColor.systemBackground.withAlphaComponent(0.95)
        containerView.layer.cornerRadius = 25
        containerView.layer.shadowColor = UIColor.black.cgColor
        containerView.layer.shadowOffset = CGSize(width: 0, height: 2)
        containerView.layer.shadowRadius = 8
        containerView.layer.shadowOpacity = 0.1
        view.addSubview(containerView)
        
        // Incidents button
        let incidentsButton = UIButton(type: .system)
        incidentsButton.translatesAutoresizingMaskIntoConstraints = false
        incidentsButton.setTitle("📊 Incidents (\(incidents.count))", for: .normal)
        incidentsButton.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .semibold)
        incidentsButton.backgroundColor = UIColor.systemBlue
        incidentsButton.setTitleColor(.white, for: .normal)
        incidentsButton.layer.cornerRadius = 20
        incidentsButton.addTarget(self, action: #selector(showIncidentsList), for: .touchUpInside)
        containerView.addSubview(incidentsButton)
        
        // Add incident button
        let addButton = UIButton(type: .system)
        addButton.translatesAutoresizingMaskIntoConstraints = false
        addButton.setTitle("➕", for: .normal)
        addButton.titleLabel?.font = UIFont.systemFont(ofSize: 24)
        addButton.backgroundColor = UIColor.systemGreen
        addButton.setTitleColor(.white, for: .normal)
        addButton.layer.cornerRadius = 25
        addButton.addTarget(self, action: #selector(addNewIncident), for: .touchUpInside)
        containerView.addSubview(addButton)
        
        NSLayoutConstraint.activate([
            containerView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            containerView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            containerView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -20),
            containerView.heightAnchor.constraint(equalToConstant: 60),
            
            incidentsButton.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 15),
            incidentsButton.centerYAnchor.constraint(equalTo: containerView.centerYAnchor),
            incidentsButton.heightAnchor.constraint(equalToConstant: 40),
            incidentsButton.widthAnchor.constraint(greaterThanOrEqualToConstant: 120),
            
            addButton.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -15),
            addButton.centerYAnchor.constraint(equalTo: containerView.centerYAnchor),
            addButton.widthAnchor.constraint(equalToConstant: 50),
            addButton.heightAnchor.constraint(equalToConstant: 50)
        ])
    }
    
    @objc private func showIncidentsList() {
        let alert = UIAlertController(title: "📊 Reported Incidents", message: nil, preferredStyle: .actionSheet)
        
        if incidents.isEmpty {
            alert.message = "No incidents reported yet."
        } else {
            for incident in incidents {
                let action = UIAlertAction(title: "\(incident.type.rawValue) - \(incident.severity.rawValue)", style: .default) { [weak self] _ in
                    self?.showIncidentDetails(incident)
                }
                alert.addAction(action)
            }
        }
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }
    
    @objc private func addNewIncident() {
        // Haritanın merkezine incident ekle
        let centerCoordinate = mapView.mapboxMap.cameraState.center
        let form = IncidentFormViewController(coordinate: centerCoordinate)
        form.delegate = self
        let nav = UINavigationController(rootViewController: form)
        present(nav, animated: true)
    }
    
    private func updateToolbar() {
        // Yeni floating toolbar'daki incidents button'ı güncelle
        if let containerView = view.subviews.first(where: { $0 is UIView && $0.layer.cornerRadius == 25 }),
           let incidentsButton = containerView.subviews.first(where: { $0 is UIButton && $0.backgroundColor == UIColor.systemBlue }) as? UIButton {
            incidentsButton.setTitle("📊 Incidents (\(incidents.count))", for: .normal)
        }
    }
    
    // MARK: - Helper Methods
    private func getEmojiForType(_ type: Incident.IncidentType) -> String {
        switch type {
        case .crash: return "🚗💥"
        case .slowdown: return "🐌"
        case .construction: return "🚧"
        case .laneClosure: return "🚫"
        case .objectOnRoad: return "⚠️"
        }
    }
    
    private func getColorForSeverity(_ severity: Incident.Severity) -> UIColor {
        switch severity {
        case .low: return .systemGreen
        case .medium: return .systemOrange
        case .high: return .systemRed
        }
    }
    
    private func getSeverityEmoji(_ severity: Incident.Severity) -> String {
        switch severity {
        case .low: return "🟢"
        case .medium: return "🟡"
        case .high: return "🔴"
        }
    }
    
}
