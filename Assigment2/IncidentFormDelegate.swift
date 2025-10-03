import Foundation

protocol IncidentFormDelegate: AnyObject {
    func incidentFormDidSubmit(_ incident: Incident)
    func incidentFormDidCancel()
}
