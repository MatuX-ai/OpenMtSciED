# System Architecture

```mermaid
graph TD
    A[Web Frontend: Angular] -->|Auth & Download| B[Backend: FastAPI]
    B -->|Query Path| C[Neo4j Graph DB]
    B -->|Store Metadata| D[PostgreSQL]
    E[Desktop App: Tauri + Angular] -->|Local Storage| F[SQLite]
    E -->|Hardware Control| G[Arduino/ESP32 via WebUSB]
    E -->|Visual Programming| H[Blockly Engine]
```

## Components

1. **Web Portal**: Minimalist marketing site for user registration and app download.
2. **Desktop Client**: Core learning environment built with Tauri (Rust) and Angular.
3. **Path Engine**: Python FastAPI service that generates STEM learning paths from Neo4j.
4. **Knowledge Graph**: Neo4j database linking tutorials, textbooks, and hardware projects.
5. **Hardware Layer**: Local communication with microcontrollers via WebUSB.
