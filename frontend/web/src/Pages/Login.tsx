
import "./login.css";

function Login() {
    return (
        <div className="login-container">
            <div className="login-card">

                <h1>Welcome Back!</h1>
                <p>Employee Onboarding Portal</p>

                <form>
                    <label>Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        required
                    />

                    <button type="submit">
                        Login
                    </button>

                    <p>New employee? Register here.</p>
                </form>

            </div>
        </div>
    );
}

export default Login;
