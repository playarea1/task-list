# Task List

A task manager built with Rails 8, React and PostgreSQL. You can sign up, add tasks with notes, a priority and a due date, edit them in place, mark them done, delete them, and filter by to do, done or all.

To look around without creating an account, click **Try the demo account** on the sign-in page.

## Stack

- Ruby 3.3, Rails 8.1, PostgreSQL
- React 19 and TypeScript, built with Vite through `vite_rails`
- Minitest for models and the API, Cypress for the browser flows
- GitHub Actions for CI

## Running it locally

You need Ruby 3.3.4, Node 22 and a running PostgreSQL server.

```bash
bundle install
npm install
bin/rails db:prepare
bin/rails server
```

Then open http://localhost:3000. The demo account is `demo@example.com` with the password `demo-password`.

Rails rebuilds the frontend on the next request after a change. For hot reloading, also run `bin/vite dev`.

## Tests

```bash
bin/rails test       # models and API
bin/e2e              # Cypress, on its own database
npm run typecheck    # TypeScript
bin/rubocop          # Ruby style
```

## API

Everything is under `/api/tasks`, needs a signed-in session and is limited to the current user's tasks.

| Request | Does | Responds with |
| --- | --- | --- |
| `GET /api/tasks?status=pending` | Lists tasks (`pending`, `completed` or `all`) with a count for each status | 200 |
| `POST /api/tasks` | Creates a task | 201, or 422 with errors |
| `PATCH /api/tasks/:id` | Updates a task | 200, or 422 with errors |
| `PATCH /api/tasks/:id/complete` | Marks a task done | 200 |
| `PATCH /api/tasks/:id/reopen` | Marks a task not done | 200 |
| `DELETE /api/tasks/:id` | Deletes a task | 204 |

A signed-out request gets a 401. Asking for another user's task gets a 404, because tasks are always looked up through `Current.user.tasks`.

## Decisions

- **REST rather than GraphQL.** This is one resource with a handful of actions, and that maps directly onto a Rails controller. GraphQL would pay off with more types and more clients.
- **Rails' built-in authentication rather than Devise.** The generator covers sign-in and sessions, and I added sign-up. Sessions are stored in the database, so signing out really ends them on the server.
- **`completed_at` rather than a `completed` boolean.** One column records both whether a task is done and when.
- **One app and one deploy.** Rails serves React from the same domain, so there is no CORS setup and the session cookie just works. Sign-in and sign-up are plain Rails views, and React loads only after login.
- **Plain CSS.** The app is small enough that a UI library would add more than it saves.

## Known limits and what I'd do next

- The task list has no pagination yet, and there is no search.
- Password reset is left out because the app doesn't send email.
- Everyone using the demo account shares the same tasks. A nightly reset or a throwaway demo user per visitor would fix that.
