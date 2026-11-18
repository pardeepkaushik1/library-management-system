import { useEffect, useState } from "react";
import API from "../service/api";

function Dashboard() {

    const [stats, setStats] = useState(null);

    useEffect(() => {

        const token = sessionStorage.getItem("token");

        API.get("/admin/stats", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((response) => {
            setStats(response.data.stats);
        })
        .catch((error) => {
            console.log("Dashboard error:", error);
        });

    }, []);

    if (!stats) {
        return <p className="loading-state">Loading your library dashboard...</p>;
    }

    return (
        <main className="page-shell">

            <h1 className="page-heading">
                Library Dashboard
            </h1>

            <section className="stat-grid" aria-label="Library statistics">

                <div className="stat-card">
                    <h2 className="stat-label">Total Books</h2>
                    <p className="stat-value">{stats.totalBooks}</p>
                </div>

                <div className="stat-card">
                    <h2 className="stat-label">Total Students</h2>
                    <p className="stat-value">{stats.totalStudents}</p>
                </div>

                <div className="stat-card">
                    <h2 className="stat-label">Currently Issued</h2>
                    <p className="stat-value">{stats.currentlyIssued}</p>
                </div>

                <div className="stat-card">
                    <h2 className="stat-label">Returned Books</h2>
                    <p className="stat-value">{stats.returnedBooks}</p>
                </div>

                <div className="stat-card">
                    <h2 className="stat-label">Total Issue Records</h2>
                    <p className="stat-value">{stats.totalIssuedRecords}</p>
                </div>

            </section>

        </main>
    );
}

export default Dashboard;