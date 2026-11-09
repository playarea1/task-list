# Task List

**Live app:** https://13.184.244.165.sslip.io

A task manager built with Rails 8, React and PostgreSQL. You can sign up, add tasks with notes, a priority and a due date, edit them in place, mark them done, delete them, and filter by to do, done or all.

To look around without creating an account, click **Try the demo account** on the sign-in page.

## Stack

- Ruby 3.3, Rails 8.1, PostgreSQL
- React 19 and TypeScript, built with Vite through `vite_rails`
- Minitest for models and the API, Cypress for the browser flows
- GitHub Actions for CI and deployment
- Docker and Kamal, running on a single AWS EC2 server

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

## Deployment

Every push to `main` runs the security scan, RuboCop, the TypeScript check, Rails tests, Cypress and a production image build. If all of them pass, GitHub Actions publishes the image to GitHub's container registry and Kamal deploys it to EC2. Kamal moves traffic to the new container only after it passes the `/up` health check, and migrations run when the container starts.

## Decisions

I went with REST instead of GraphQL. I know you use GraphQL, and I did think about it, but this app is really just one resource and a few actions. A normal Rails controller does that job with less code. I'd want GraphQL once there were more types of data and more clients asking for different shapes of it.

For login I used the authentication generator that comes with Rails 8 instead of Devise. The app only needs sign-in, sign-up and sessions, and this way all of the code is sitting in the repo where I can read and change it. The generator doesn't do sign-up, so I added that. If this needed email confirmation or OAuth, I'd probably switch to Devise.

Tasks have a `completed_at` timestamp rather than a `completed` true/false. It's the same one column, but now I also know when something was finished.

React and Rails are one app on one domain. I didn't see a reason to split them for something this size, and keeping them together meant no CORS setup and no tokens to manage, since the session cookie just works. The sign-in and sign-up pages are still regular Rails views.

The styling is plain CSS. It's one file, and for an app this small I didn't think a UI library would save me much.

## Known limits and what I'd do next

- The task list has no pagination yet, and there is no search.
- Password reset is left out because the app doesn't send email.
- The app and PostgreSQL share one small server, which is fine for a demo. For real traffic I'd move the database to RDS and run at least two app servers.
- Everyone using the demo account shares the same tasks. A nightly reset or a throwaway demo user per visitor would fix that.
