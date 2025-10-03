import UIKit
import CoreLocation

final class IncidentFormViewController: UIViewController,
                                        UIPickerViewDataSource, UIPickerViewDelegate {

    weak var delegate: IncidentFormDelegate?

    private let coordinate: CLLocationCoordinate2D
    private let typePicker = UIPickerView()
    private let severity = UISegmentedControl(items: Incident.Severity.allCases.map { $0.rawValue.capitalized })
    private let descView = UITextView()
    private let types = Incident.IncidentType.allCases

    init(coordinate: CLLocationCoordinate2D) {
        self.coordinate = coordinate
        super.init(nibName: nil, bundle: nil)
        modalPresentationStyle = .formSheet
    }
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = "New Incident"

        typePicker.dataSource = self
        typePicker.delegate = self

        severity.selectedSegmentIndex = 1

        descView.layer.borderWidth = 1
        descView.layer.cornerRadius = 8
        descView.layer.borderColor = UIColor.separator.cgColor

        navigationItem.leftBarButtonItem = .init(barButtonSystemItem: .cancel, target: self, action: #selector(cancel))
        navigationItem.rightBarButtonItem = .init(barButtonSystemItem: .save, target: self, action: #selector(save))

        let stack = UIStackView(arrangedSubviews: [labeled("Type", typePicker),
                                                   labeled("Severity", severity),
                                                   labeled("Description", descView)])
        stack.axis = .vertical
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)

        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            stack.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
            descView.heightAnchor.constraint(equalToConstant: 100)
        ])
    }

    private func labeled(_ title: String, _ v: UIView) -> UIStackView {
        let label = UILabel()
        label.text = title
        label.font = .systemFont(ofSize: 13, weight: .semibold)
        let s = UIStackView(arrangedSubviews: [label, v])
        s.axis = .vertical
        s.spacing = 6
        return s
    }

    // MARK: Picker
    func numberOfComponents(in _: UIPickerView) -> Int { 1 }
    func pickerView(_: UIPickerView, numberOfRowsInComponent _: Int) -> Int { types.count }
    func pickerView(_: UIPickerView, titleForRow row: Int, forComponent _: Int) -> String? {
        types[row].rawValue.capitalized
    }

    // MARK: Actions
    @objc private func cancel() {
        delegate?.incidentFormDidCancel()
        dismiss(animated: true)
    }

    @objc private func save() {
        let incident = Incident(
            type: types[typePicker.selectedRow(inComponent: 0)],
            severity: Incident.Severity.allCases[severity.selectedSegmentIndex],
            coordinate: coordinate,
            description: descView.text.isEmpty ? nil : descView.text,
            image: nil
        )
        // Önce formu kapat, sonra delegate'e haber ver (present çakışmasını önler)
        dismiss(animated: true) { [weak self] in
            self?.delegate?.incidentFormDidSubmit(incident)
        }
    }
}
