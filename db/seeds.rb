demo = User.find_or_create_by!(email_address: User::DEMO_EMAIL) do |user|
  user.password = User::DEMO_PASSWORD
end

if demo.tasks.none?
  demo.tasks.create!([
    { title: "Read through the project README", priority: :high, due_on: Date.current },
    { title: "Try editing a task inline", description: "Click a title to rename it.", priority: :medium },
    { title: "Plan next week's sprint", priority: :low, due_on: 3.days.from_now },
    { title: "Renew domain name", priority: :high, due_on: 2.days.ago },
    { title: "Set up the project", priority: :medium, completed_at: 1.day.ago }
  ])
end
