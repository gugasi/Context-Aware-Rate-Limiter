

### **Author**

* **Guram S** - [GitHub Profile](https://github.com/gugasi)




# Propcorn AI - Intelligent, Context-Aware Rate Limiter

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

### **Project Philosophy**

This project was built to address the task of a "simple rate limiter with on-the-fly modification" by interpreting "fittable" not just as configurable, but as *adaptive*. The core philosophy is that a rate limiter shouldn't be a dumb gate; it should be an intelligent, context-aware system that protects the API while simultaneously providing business value.

This solution demonstrates a "hacker mentality" by delivering a "double feature":
1.  **A Robust, Dynamic Rate Limiter:** Protects the API from abuse.
2.  **An Intelligent User Profiling System:** Actively identifies and segregates user behavior into tiers (Low, Normal, High Trust), allowing the service to treat legitimate power users differently from potential threats.

---

### **Core Features**

* **Live Visual Scoreboard:** A web-based dashboard at `/scoreboard` to visualize Trust Scores updating in real-time.
* **Dynamic On-the-Fly Configuration:** All rate limit rules can be updated in real-time via a secure admin API without service restarts.
* **Per-Identifier Limiting:** The system correctly applies rules based on a client identifier (API key or fallback to IP address).
* **Intelligent Trust Scoring:** The service maintains a "Trust Score" for each client. This score is dynamically adjusted based on behavior.
* **Adaptive Rate Tiers:** A client's Trust Score directly impacts their rate limit. Users with high trust receive more generous limits, while users with low trust are more strictly throttled.
* **Secure Admin Endpoints:** Administrative functions are protected by a secret API key.

---

### **Technology Stack**

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Rate Limiting:** `rate-limiter-flexible`
* **State Management:** In-memory `Map` (designed for easy migration to Redis).
* **Development:** `ts-node-dev` for live reloading.
* **Linting/Formatting:** ESLint and Prettier.

---

### **Setup & Running the Project**

1.  **Clone the repository and navigate into the directory.**

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a `.env` file in the project root and add the following variables.
    ```env
    PORT=3000
    ADMIN_API_KEY=supersecretkey
    ```

4.  **Run the development server:**
    This command starts the server with live-reloading.
    ```bash
    npm run dev
    ```
    *(Note: On Windows `cmd.exe`, you may need to run `npx ts-node-dev ...` if the command is not found.)*

---

### **Live Scoreboard**

To see the Intelligent Trust Score system in action, open your web browser and navigate to:

**`http://localhost:3000/scoreboard`**

This page polls the `/admin/scores` endpoint every 3 seconds and displays the scores for all tracked API keys and IP addresses. You can run `curl` commands in your terminal and watch the scores change in real-time on this page.

---

### **API Endpoints**

The service exposes two sets of endpoints: the public API and the admin API.

#### **Admin API**

All admin routes require an `x-admin-api-key` header matching the `ADMIN_API_KEY` in your `.env` file.

| Method | Endpoint                       | Description                                                                 |
| :----- | :----------------------------- | :-------------------------------------------------------------------------- |
| `GET`  | `/admin/config`                | Retrieves the current rate limit configuration (default and user-specific). |
| `POST` | `/admin/config/default`        | Updates the default rate limit rule. Body: `{ "points": 10, "duration": 60 }` |
| `POST` | `/admin/config/user`           | Sets a specific rule for a user. Body: `{ "identifier": "some-key", "points": 50 }` |
| `DELETE`| `/admin/config/user/:identifier` | Deletes a user-specific rule. |
| `GET`  | `/admin/scores`                | **(Trust Score Feature)** Retrieves the current trust scores of all tracked users. |

#### **Public API**

These routes are protected by the rate limiter. Requests can include an `x-api-key` header to be identified.

| Method | Endpoint     | Description                                               |
| :----- | :----------- | :-------------------------------------------------------- |
| `GET`  | `/api/data`  | A sample protected endpoint.                              |
| `POST` | `/api/submit`| A sample protected endpoint that also increases trust score on success. |
