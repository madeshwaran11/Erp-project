import "../Auth.css";
import Brand from "./Brand";
import BusinessScene from "./BusinessScene";

export default function AuthLayout({ children, wide = false }) {
  return <main className="login-page cinematic-login">
    <section className="login-panel">
      <div className={wide ? "login-card login-card-wide" : "login-card"}>
        <Brand />
        {children}
      </div>
      <footer className="panel-footer">© 2026 PriyoniX ERP. All rights reserved.</footer>
    </section>
    <section className="login-visual">
      <div className="visual-content">
        <h1>Your entire business.<br /><span>Working as one.</span></h1>
        <p>People. Projects. Possibilities.</p>
      </div>
      <BusinessScene decorative />
      <p className="visual-footer">One connected workspace. Every working day.</p>
    </section>
  </main>;
}
