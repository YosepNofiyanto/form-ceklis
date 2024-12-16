document.addEventListener("DOMContentLoaded", () => {
    const loginPage = document.getElementById("loginPage");
    const mainPage = document.getElementById("mainPage");
    const loginForm = document.getElementById("loginForm");
    const formPage = document.getElementById("formPage");
    const dashboardPage = document.getElementById("dashboardPage");
    const ceklisForm = document.getElementById("ceklisForm");
    const dashboardTable = document.querySelector("#dashboardTable tbody");
    const filterTanggal = document.getElementById("filterTanggal");
    const filterBtn = document.getElementById("filterBtn");
    const formBtn = document.getElementById("formBtn");
    const dashboardBtn = document.getElementById("dashboardBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // Fungsi untuk login
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputUsername = document.getElementById("username").value;
        const inputPassword = document.getElementById("password").value;

        fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: inputUsername, password: inputPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Login berhasil!") {
                localStorage.setItem("isLoggedIn", true);
                loginPage.style.display = "none";
                mainPage.style.display = "block";
            } else {
                alert("Username atau password salah!");
            }
        })
        .catch(error => console.error("Error:", error));
    });

    // Mengecek login state
    if (localStorage.getItem("isLoggedIn")) {
        loginPage.style.display = "none";
        mainPage.style.display = "block";
    }

    // Render dashboard
    const renderDashboard = () => {
        fetch("/api/ceklis")
            .then(response => response.json())
            .then(data => {
                dashboardTable.innerHTML = "";
                data.forEach((item, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${item.tanggal}</td>
                        <td>${item.dilakukanOleh}</td>
                        <td>${item.noPolisi || "-"}</td>
                        <td>${item.namaSopir || "-"}</td>
                        <td>${item.noBuntut || "-"}</td>
                        <td>${item.statusSegel}</td>
                        <td>${item.keterangan || "-"}</td>
                        <td><button class="deleteBtn" data-index="${index}">Hapus</button></td>
                    `;
                    dashboardTable.appendChild(row);
                });

                // Add delete functionality
                document.querySelectorAll(".deleteBtn").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        const index = e.target.getAttribute("data-index");
                        fetch(`/api/ceklis/${index}`, {
                            method: "DELETE"
                        })
                        .then(response => response.json())
                        .then(data => {
                            renderDashboard(); // Refresh the dashboard
                        });
                    });
                });
            })
            .catch(error => console.error("Error:", error));
    };

    // Menyimpan data ceklis
    ceklisForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const tanggal = document.getElementById("tanggal").value;
        const dilakukanOleh = document.getElementById("dilakukanOleh").value;
        const noPolisi = document.getElementById("noPolisi").value || null;
        const namaSopir = document.getElementById("namaSopir").value || null;
        const noBuntut = document.getElementById("noBuntut").value || null;
        const statusSegel = document.getElementById("statusSegel").value;
        const keterangan = document.getElementById("keterangan").value || null;

        const newCeklis = { tanggal, dilakukanOleh, noPolisi, namaSopir, noBuntut, statusSegel, keterangan };

        fetch("/api/ceklis", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newCeklis)
        })
        .then(response => response.json())
        .then(data => {
            ceklisForm.reset();
            alert("Data ceklis berhasil disimpan!");
            renderDashboard(); // Refresh the dashboard
        })
        .catch(error => console.error("Error:", error));
    });

    // Filter dashboard data
    filterBtn.addEventListener("click", () => {
        const filterDate = filterTanggal.value;
        fetch(`/api/ceklis?date=${filterDate}`)
            .then(response => response.json())
            .then(data => renderDashboard(data))
            .catch(error => console.error("Error:", error));
    });

    // Switching pages
    formBtn.addEventListener("click", () => {
        formPage.style.display = "block";
        dashboardPage.style.display = "none";
    });

    dashboardBtn.addEventListener("click", () => {
        formPage.style.display = "none";
        dashboardPage.style.display = "block";
        renderDashboard();
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        location.reload();
    });
});
