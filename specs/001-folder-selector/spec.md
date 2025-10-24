# Feature Specification: Data Folder Selector

**Feature Branch**: `001-folder-selector`  
**Created**: 2025-10-25  
**Status**: Draft  
**Input**: User description: "The user will be able to select a folder from data folder which includes chat history extracts for chats from chatgpt, this is to allow the user to select which extract to explore in the app"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Available Chat Extracts (Priority: P1)

Users need to see what ChatGPT export folders are available in their data directory so they can choose which conversation history to explore.

**Why this priority**: This is the entry point to the entire application. Without the ability to see available extracts, users cannot proceed to any other functionality. This delivers immediate value by showing users what data they have.

**Independent Test**: Can be fully tested by placing sample extract folders in the data directory, loading the app, and verifying that all folders are displayed with recognizable names or identifiers.

**Acceptance Scenarios**:

1. **Given** the data folder contains multiple extract folders, **When** the user opens the application, **Then** a list of all available extract folders is displayed
2. **Given** the data folder is empty, **When** the user opens the application, **Then** a friendly message indicates no chat extracts are available
3. **Given** the data folder contains extract folders with different naming patterns, **When** the user views the list, **Then** each folder is displayed with a clear identifier (folder name or extracted metadata)

---

### User Story 2 - Select an Extract to Explore (Priority: P2)

Users need to choose a specific chat export from the list to view its conversation history in the application.

**Why this priority**: This enables the core interaction of the app - selecting which data set to explore. It builds directly on P1 and enables all future conversation viewing features.

**Independent Test**: Can be tested by displaying a list of extracts, clicking on one, and verifying the selection is registered and the app is ready to display that extract's data.

**Acceptance Scenarios**:

1. **Given** a list of available extracts is displayed, **When** the user clicks on an extract folder, **Then** that extract is selected and the app prepares to display its contents
2. **Given** an extract is selected, **When** the user wants to switch to a different extract, **Then** they can return to the folder list and select a different folder
3. **Given** a user clicks on an extract folder, **When** the selection is made, **Then** visual feedback confirms which extract is currently active

---

### User Story 3 - Handle Invalid or Empty Extracts (Priority: P3)

Users should receive clear feedback when an extract folder doesn't contain valid ChatGPT export data or is corrupted.

**Why this priority**: This improves user experience by providing helpful error handling, but the core functionality works without it. Users can still successfully use valid extracts.

**Independent Test**: Can be tested by placing folders with missing files, invalid JSON, or empty folders in the data directory and verifying appropriate error messages appear.

**Acceptance Scenarios**:

1. **Given** an extract folder is missing required files (conversations.json, chat.html, etc.), **When** the user selects it, **Then** an error message explains which files are missing
2. **Given** an extract folder contains malformed JSON files, **When** the user selects it, **Then** an error message indicates the data is corrupted
3. **Given** validation fails for an extract, **When** the error is displayed, **Then** the user can dismiss the error and select a different extract

---

### Edge Cases

- What happens when the data folder itself doesn't exist?
- What happens when folder names contain special characters or unicode?
- What happens if the user has dozens of extract folders?
- What happens when an extract folder is being modified while the user is viewing the list?
- What happens if file permissions prevent reading the data folder?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST scan the data directory and identify all subdirectories as potential chat extracts
- **FR-002**: System MUST display a list of available extract folders to the user
- **FR-003**: Users MUST be able to select a specific extract folder from the list
- **FR-004**: System MUST provide visual feedback indicating which extract is currently selected
- **FR-005**: System MUST handle cases where the data directory is empty by showing an appropriate message
- **FR-006**: System MUST validate that selected extract folders contain expected ChatGPT export files (conversations.json and/or chat.html)
- **FR-007**: System MUST display clear error messages when an extract folder is invalid or missing required files
- **FR-008**: Users MUST be able to switch between different extract folders without reloading the page
- **FR-009**: System MUST gracefully handle file system access errors (permissions, missing directory, etc.)
- **FR-010**: System MUST display extract folders in a consistent, predictable order (alphabetically by folder name)

### Key Entities

- **Extract Folder**: A subdirectory within the data folder containing ChatGPT export files. Key attributes: folder name, path, validation status (valid/invalid), list of contained files
- **Data Directory**: The root data folder containing all extract folders. Key attributes: path, list of child directories, existence status
- **Extract Metadata**: Information about a chat extract derived from folder contents. Key attributes: folder name, file list, validation errors (if any)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify and select an extract folder within 10 seconds of opening the application
- **SC-002**: Application correctly identifies and displays 100% of valid extract folders in the data directory
- **SC-003**: Users receive clear error feedback within 2 seconds when selecting an invalid extract folder
- **SC-004**: Application handles data directories containing up to 100 extract folders without performance degradation
- **SC-005**: 95% of users successfully select their intended extract on the first attempt
- **SC-006**: Zero crashes or unhandled errors when the data directory is empty, missing, or contains invalid folders

## Assumptions

- Extract folders follow the structure observed in the provided sample data (extract1 folder with conversations.json, chat.html, etc.)
- Users have read permissions for the data directory and its contents
- Extract folder names are unique within the data directory
- The browser supports the File System Access API or the application uses a file input for directory selection
- Extract folders can be identified by the presence of key files like conversations.json or chat.html
