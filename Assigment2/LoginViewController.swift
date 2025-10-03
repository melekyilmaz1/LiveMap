
import UIKit


private struct LoginResponse: Decodable {
    let access_token: String?
    let user: User?
    struct User: Decodable {
        let id: Int?
        let email: String?
        let name: String?
        let role: String?
    }
}


class LoginViewController: UIViewController {
    
    @IBOutlet weak var usernameTextField: UITextField!
    @IBOutlet weak var passwordTextField: UITextField!
    
   private let baseURL = URL(string: "http://127.0.0.1:3000")!
    private var spinner: UIActivityIndicatorView?

    override func viewDidLoad() {
        super.viewDidLoad()
        [usernameTextField, passwordTextField].forEach {
            $0?.layer.cornerRadius = 10
            $0?.layer.masksToBounds = true
        }
    }

      
    @IBAction func loginButtonTapped(_ sender: Any) {
    
        let rawInput = (usernameTextField.text ?? "")
        let password = (passwordTextField.text ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let identifier = rawInput.trimmingCharacters(in: .whitespacesAndNewlines)

        guard !identifier.isEmpty, !password.isEmpty else {
            showAlert(title: "Hata", message: "Lütfen tüm alanları doldurun.")
            return
        }

        setLoading(true)
        checkServerAvailability { [weak self] alive in
            guard let self = self else { return }
            DispatchQueue.main.async {
                if !alive {
                    self.setLoading(false)
                    self.showAlert(title: "Bağlantı Hatası", message: "Backend çalışmıyor veya erişilemiyor.")
                    return
                }
                self.performLogin(identifier: identifier, password: password)
            }
        }
    }

    private func isValidEmail(_ s: String) -> Bool {
        let pattern = #"^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$"#
        return s.range(of: pattern, options: [.regularExpression, .caseInsensitive]) != nil
    }

    private func isDigitsOnly(_ s: String) -> Bool {
        !s.isEmpty && s.range(of: "^[0-9]+$", options: .regularExpression) != nil
    }

    private func makeEmail(fromID id: String) -> String { "\(id)@id.local" }

    private func checkServerAvailability(completion: @escaping (Bool) -> Void) {
        var req = URLRequest(url: baseURL.appendingPathComponent("auth/login"))
        req.httpMethod = "HEAD"
        req.timeoutInterval = 2
        let cfg = URLSessionConfiguration.default
        cfg.waitsForConnectivity = false
        URLSession(configuration: cfg).dataTask(with: req) { _, resp, err in
            if let _ = err { completion(false); return }
            guard let http = resp as? HTTPURLResponse else { completion(false); return }
            completion((200...499).contains(http.statusCode))
        }.resume()
    }

    private func performLogin(identifier: String, password: String) {
        // Backend LoginDto: { identifier: string, password: string }
        let body: [String: Any] = [
            "identifier": identifier,
            "password": password
        ]

        var req = URLRequest(url: baseURL.appendingPathComponent("auth/login"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 10
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)

        let cfg = URLSessionConfiguration.default
        cfg.waitsForConnectivity = false
        URLSession(configuration: cfg).dataTask(with: req) { [weak self] data, resp, err in
            guard let self = self else { return }
            defer { DispatchQueue.main.async { self.setLoading(false) } }

            if let err = err {
                DispatchQueue.main.async { self.showAlert(title: "Bağlantı Hatası", message: err.localizedDescription) }
                return
            }

            guard let http = resp as? HTTPURLResponse, let data = data else {
                DispatchQueue.main.async { self.showAlert(title: "Server Hatası", message: "Geçersiz yanıt.") }
                return
            }

            switch http.statusCode {
            case 200:
                if let decoded = try? JSONDecoder().decode(LoginResponse.self, from: data) {
                    if let token = decoded.access_token { UserDefaults.standard.set(token, forKey: "jwtToken") }
                    if let role = decoded.user?.role   { UserDefaults.standard.set(role, forKey: "userRole") }
                }
                DispatchQueue.main.async { self.performSegue(withIdentifier: "toMap", sender: nil) }
            case 401:
                DispatchQueue.main.async { self.showAlert(title: "Giriş Başarısız", message: "Kullanıcı adı/e-posta/ID veya şifre hatalı!") }
            case 500:
                DispatchQueue.main.async { self.showAlert(title: "Server Hatası", message: "Sunucu hatası oluştu.") }
            default:
                let msg = String(data: data, encoding: .utf8) ?? "Beklenmeyen durum (\(http.statusCode))."
                DispatchQueue.main.async { self.showAlert(title: "Hata", message: msg) }
            }
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
