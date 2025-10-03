import CoreLocation
import UIKit

struct Incident {
    enum IncidentType: String, CaseIterable { 
        case crash = "Crash"
        case slowdown = "Slowdown"
        case construction = "Construction"
        case laneClosure = "Lane Closure"
        case objectOnRoad = "Object on Road"
    }
    
    enum Severity: String, CaseIterable { 
        case low = "Low"
        case medium = "Medium" 
        case high = "High"
    }

    let id: String
    let type: IncidentType
    let severity: Severity
    let coordinate: CLLocationCoordinate2D
    let description: String?
    let image: UIImage?
    let timestamp: Date
    let reporterCount: Int
    
    init(type: IncidentType, severity: Severity, coordinate: CLLocationCoordinate2D, description: String?, image: UIImage?) {
        self.id = UUID().uuidString
        self.type = type
        self.severity = severity
        self.coordinate = coordinate
        self.description = description
        self.image = image
        self.timestamp = Date()
        self.reporterCount = 1
    }
    
    init(id: String, type: IncidentType, severity: Severity, coordinate: CLLocationCoordinate2D, description: String?, image: UIImage?, timestamp: Date, reporterCount: Int) {
        self.id = id
        self.type = type
        self.severity = severity
        self.coordinate = coordinate
        self.description = description
        self.image = image
        self.timestamp = timestamp
        self.reporterCount = reporterCount
    }
}
