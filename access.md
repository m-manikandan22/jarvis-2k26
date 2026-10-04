# How to Run the Jarvis 2k26 Project

To run both the **Registration Portal** and the **Admin Portal**, you must open **two separate terminal windows** because both servers need to stay running simultaneously.

## 1. Run the Registration Portal
Open your first terminal and execute:
```powershell
cd C:\Users\ELCOT\Music\project\jarvis-2k26
npm run dev
```
*   **Description:** Starts the Vite development server for the main registration site.
*   **Access URL:** Look for the `Local` link in the output (typically `http://localhost:5173/`).

## 2. Run the Admin Portal
Open a **second terminal window** and execute:
```powershell
cd C:\Users\ELCOT\Music\project\jarvis-2k26\jarvis-2k26-admin
npm run dev
```
*   **Description:** Starts the Vite development server for the admin dashboard.
*   **Access URL:** Look for the `Local` link in the output (typically `http://localhost:5174/`).

---

## Summary Table

| Portal | Folder Path | Command | Typical URL |
| :--- | :--- | :--- | :--- |
| **Registration** | `\jarvis-2k26` | `npm run dev` | `http://localhost:5173` |
| **Admin** | `\jarvis-2k26\jarvis-2k26-admin` | `npm run dev` | `http://localhost:5174` |

## Troubleshooting

- **npm not recognized:** Install [Node.js](https://nodejs.org/).
- **Missing node_modules:** If you get an error about missing packages, run `npm install` in the respective folder before running `npm run dev`.
- **Stopping servers:** Press `Ctrl + C` in the terminal window to stop a server.
