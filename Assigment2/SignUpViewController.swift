import UIKit

class SignUpViewController: UIViewController {
    
    
    
    
    
    @IBOutlet weak var usernameTextField: UITextField!
    
    @IBOutlet weak var passwordTextField: UITextField!
    
    // Added to satisfy storyboard outlet connection and avoid runtime crash
   
    @IBOutlet weak var idTextField: UITextField!
    
    
    private let baseURL = URL(string: "http://127.0.0.1:3000")! // Simulator için
       private var spinner: UIActivityIndicatorView?

       override func viewDidLoad() {
           super.viewDidLoad()
           // Butona storyboard’dan IBAction bağlayacaksın: signUpTapped:
       }

       // MARK: - Helpers
       private func makeEmail(fromID id: String) -> String { "\(id)@id.local" }
       private func isDigitsOnly(_ s: String) -> Bool { !s.isEmpty && s.range(of: "^[0-9]+$", options: .regularExpression) != nil }

    
    
    @IBAction func signUpTapped(_ sender: Any) {
    
    
    let id = (idTextField.text ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let name = (usernameTextField.text ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let password = (passwordTextField.text ?? "").trimmingCharacters(in: .whitespacesAndNewlines)

        guard isDigitsOnly(id) else {
            showAlert(title: "Hata", message: "ID sadece rakam olmalı.")
            return
        }
        guard !name.isEmpty, !password.isEmpty else {
            showAlert(title: "Hata", message: "İsim ve şifre gerekli.")
            return
        }

        let email = makeEmail(fromID: id)
        setLoading(true)
        performSignup(name: name, email: email, password: password)
    }

    private func performSignup(name: String, email: String, password: String) {
        var req = URLRequest(url: baseURL.appendingPathComponent("auth/signup"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 10
        req.httpBody = try? JSONSerialization.data(withJSONObject: [
            "name": name,
            "email": email,
            "password": password
        ])

        URLSession.shared.dataTask(with: req) { [weak self] data, resp, err in
            guard let self = self else { return }
            defer { DispatchQueue.main.async { self.setLoading(false) } }

            if let err = err {
                DispatchQueue.main.async { self.showAlert(title: "Bağlantı Hatası", message: err.localizedDescription) }
                return
            }
            guard let http = resp as? HTTPURLResponse else {
                DispatchQueue.main.async { self.showAlert(title: "Hata", message: "Geçersiz yanıt.") }
                return
            }

            if http.statusCode == 201 || http.statusCode == 200 {
                DispatchQueue.main.async {
                    self.showAlert(title: "Başarılı", message: "Kayıt tamamlandı. Giriş ekranına dönüyorsunuz.")
                    self.navigationController?.popViewController(animated: true)
                }
                return
            }

            if let data = data,
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                var msg = "Kayıt başarısız."
                if let arr = json["message"] as? [String], !arr.isEmpty { msg = arr.joined(separator: "\n") }
                else if let s = json["message"] as? String { msg = s }
                DispatchQueue.main.async { self.showAlert(title: "Hata", message: msg) }
                return
            }

            DispatchQueue.main.async { self.showAlert(title: "Hata", message: "Beklenmeyen durum (\((resp as? HTTPURLResponse)?.statusCode ?? -1)).") }
        }.resume()
    }

    private func setLoading(_ on: Bool) {
        if on {
            let s = UIActivityIndicatorView(style: .medium)
            s.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(s)
            NSLayoutConstraint.activate([
                s.centerXAnchor.constraint(equalTo: view.centerXAnchor),
                s.centerYAnchor.constraint(equalTo: view.centerYAnchor)
            ])
            s.startAnimating()
            spinner = s
        } else {
            spinner?.stopAnimating()
            spinner?.removeFromSuperview()
            spinner = nil
        }
    }

    private func showAlert(title: String, message: String) {
        let ac = UIAlertController(title: title, message: message, preferredStyle: .alert)
        ac.addAction(UIAlertAction(title: "Tamam", style: .default))
        present(ac, animated: true)
    }
}
