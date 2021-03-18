// const API_BASE = "https://apiv3.videoken.com/api/v3";
const API_BASE = "https://vkanalytics.videoken.com";
// const API_BASE = "https://stage-dashboard.videoken.com:8080";
// const API_BASE = "https://f425804ea7c6.ngrok.io";

function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.local.get(["auth_token"], ({ auth_token }) => {
        if (auth_token) {
            document.querySelector(".logged-in").classList.remove("hidden");
            console.log("auth_token found");
        } else {
            console.log("No auth_token found");
            document.querySelector("div.login").classList.remove("hidden");
        }
    });

    document.querySelector(".submit").addEventListener("click", async event => {
        let email = document.querySelector("input[type='email']").value;
        let password = document.querySelector("input[type='password']").value;

        if (email && password) {
            document.querySelector(".submit").classList.add("loading");
            let response = await fetch(`${API_BASE}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({ email, password }),
            });
            document.querySelector(".submit").classList.remove("loading");

            if (response.ok) {
                document.querySelector("div.login").classList.add("hidden");
                document.querySelector(".logged-in").classList.remove("hidden");

                let data = await response.json();
                let auth_token = data.dashboardtoken;

                document.querySelector(".input.email").classList.add("success");
                document.querySelector(".input.password").classList.add("success");

                chrome.storage.local.set({ auth_token }, () => {
                    console.log("Auth token set");
                });
            } else {
                document.querySelector(".submit").classList.add("failed");
                document.querySelector(".input.email").classList.add("failed");
                document.querySelector(".input.password").classList.add("failed");

                setTimeout(() => {
                    document.querySelector(".submit").classList.remove("failed");
                    document.querySelector(".input.email").classList.remove("failed");
                    document.querySelector(".input.password").classList.remove("failed");
                }, 1200);
                return false;
            }
        }
    });

    document.querySelector(".logout-button").addEventListener("click", event => {
        chrome.storage.local.set({ auth_token: null }, () => {
            console.log("Auth token cleared");
            document.querySelector(".logged-in").classList.add("hidden");
            document.querySelector("div.login").classList.remove("hidden");
            document.querySelector(".input.email").classList.remove("success");
            document.querySelector(".input.password").classList.remove("success");
            document.querySelector(".input.email").classList.remove("failed");
            document.querySelector(".input.password").classList.remove("failed");
        });
    });
}

document.addEventListener("DOMContentLoaded", restore_options);
