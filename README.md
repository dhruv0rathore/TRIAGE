Triage

A Hackathon-Built, Gemini-Powered Solution to Revolutionize Hospital Emergency Room Queues
The Problem: The Chaos of "First-Come, First-Served"
In hospital emergency rooms, every second matters. Yet, the standard operating procedure is often a linear queue where patients are seen in the order they arrive. This broken system forces patients with life-threatening conditions like chest pain to wait behind those with minor ailments, leading to dangerous delays, increased patient anxiety, and inefficient use of critical hospital resources. Manual triage, while essential, is often slow, inconsistent, and completely dependent on available staff.

Our Solution: Clarity Under Pressure
Cortex is an intelligent triage and queue management system designed to bring order to the chaos. We replace the outdated linear queue with a dynamic, real-time priority list powered by Google's Gemini 2.5 Flash. Our system empowers nurses to make faster, more accurate, and more consistent triage decisions, ensuring that the most critical patients are always moved to the front of the line.

The core philosophy is human-in-the-loop AI. We empower, not replace, medical professionals. The AI provides a powerful, data-driven recommendation, but the Head Nurse always has the final, accountable say.

Prototype in Action
This prototype was built from the ground up during an intense hackathon. The UI is designed as a "mission control" dashboard—a dark-mode, high-contrast interface built for clarity and speed in a high-pressure environment.

Nurse Intake Form

Admin Dashboard (Command Center)





Core Features
Rapid Data Capture: A streamlined, role-based interface for floor nurses to input patient vitals and symptoms on any tablet or desktop.

Gemini-Powered Analysis: Leverages Google's Gemini 2.5 Flash to instantly analyze multi-modal inputs (text & images), assigning a precise urgency score, recommending a specialist, and generating a concise report.

Real-Time Dynamic Queue: The patient list re-sorts automatically the second a new priority is assigned, providing a live, "single source of truth" for the entire department.

Human-in-the-Loop Control: The Head Nurse dashboard allows for the final review and validation of every AI recommendation, ensuring safety, accountability, and trust.

Automated Specialist Alerts: High-priority cases trigger immediate notifications, ensuring the right medical professionals are alerted without delay.

Tech Stack
Every piece of our stack was chosen for maximum speed, power, and efficiency.

Frontend (The Command Center)

React: Chosen for its rock-solid reliability and speed in building dynamic, real-time user interfaces.

Vite: Our build tool, selected for its unmatched hot-reloading and build speeds, allowing for rapid iteration.

Tailwind CSS: Used to craft the bespoke, minimalist "mission control" aesthetic without the bloat of traditional CSS.

Backend (The Engine Room)

Python & Flask: A lightweight, high-performance web framework that serves both the API and the compiled React frontend in a single, unified, and easily deployable application.

AI Core (The Brain)

Google Gemini 2.5 Flash: We use Google's latest, fastest, and most efficient model to ensure our triage analysis is not only intelligent but also instantaneous.

How to Run Locally
This project has been unified into a single Flask server for stability and ease of deployment.

Clone the repository:

git clone [[https://github.com/dhruv0rathore/TRIAGE](https://github.com/dhruv0rathore/TRIAGE)]
cd your-repo-name

Set up and run the Backend Server:

cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\Activate.ps1
# On Mac/Linux:
# source venv/bin/activate
pip install -r requirements.txt
python app.py

Open your browser and navigate to http://127.0.0.1:5000.

Future Roadmap
Database Integration: Replace the in-memory Python lists with a robust database like PostgreSQL or Firestore for data persistence.

EMR/EHR Integration: Build connectors to sync patient data with existing Electronic Medical Record systems.

Predictive Analytics: Use historical data to predict peak hours and staffing needs.

Patient-Facing App: A mobile app for patients to see their real-time position in the queue.

Author

Dhruv Singh Rathore

Built with passion and a whole lot of coffee.
