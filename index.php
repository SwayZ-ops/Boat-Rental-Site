<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>Login | Boat Rental</title>

        <link rel="stylesheet" href="styles.css">
        <script src="main.js" defer></script>
    </head>

    <body>
        <main class="login-layout">
            <section class="login-story">
                <div class="brand">
                    <img class="brand-logo" src="assets/boat-logo.png" alt="Boat Rental speedboat logo" width="56" height="40">

                    <div class="brand-text">
                        <h2>BOAT RENTAL</h2>
                        <span>Management Portal</span>
                    </div>
                </div>

                <div class="login-intro">
                    <p class="eyebrow">YOUR FLEET. YOUR HORIZON.</p>
                    <h1>Every journey<br>starts here.</h1>
                    <p>Your fleet, reservations, and rental operations.</p>
                    <div class="login-line" aria-hidden="true"></div>
                </div>

                <p class="login-footer">PRECISION ON LAND. FREEDOM ON WATER.</p>
            </section>

            <section class="login-form-area">
                <div class="login-card">
                    <h2>Welcome back.</h2>
                    <p class="muted">Sign in to your management workspace.</p>
                    <form class="login-form" id="login-form">
                        <label for="username">
                            Username
                            <input id="username" type="text" autocomplete="username" required autofocus>
                        </label>

                        <label for="password">
                            Password
                            <input id="password" type="password" autocomplete="current-password" required>
                        </label>

                        <label class="checkbox-label">
                            <input id="show-password" type="checkbox">
                            Show password
                        </label>

                        <p class="error-message" id="login-error" role="alert" hidden></p>

                        <button class="primary-button login-button" type="submit">
                            Sign in
                            <span aria-hidden="true">→</span>
                        </button>
                    </form>

                    <noscript>Enable JavaScript to use the login button.</noscript>
                </div>
            </section>
        </main>
    </body>
</html>
