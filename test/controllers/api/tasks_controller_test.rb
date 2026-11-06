require "test_helper"

class Api::TasksControllerTest < ActionDispatch::IntegrationTest
  setup { sign_in_as users(:one) }

  test "requires sign in" do
    sign_out

    get api_tasks_path, as: :json

    assert_response :unauthorized
  end

  test "index lists only the signed-in user's tasks" do
    get api_tasks_path, as: :json

    assert_response :success
    assert_equal [ "Buy groceries", "File taxes" ].sort, titles.sort
  end

  test "index filters by status" do
    get api_tasks_path(status: "pending"), as: :json

    assert_equal [ "Buy groceries" ], titles
  end

  test "index includes counts per status" do
    get api_tasks_path(status: "completed"), as: :json

    assert_equal({ "all" => 2, "pending" => 1, "completed" => 1 }, response.parsed_body["counts"])
  end

  test "create adds a task for the signed-in user" do
    assert_difference -> { users(:one).tasks.count } do
      post api_tasks_path, params: { task: { title: "Walk the dog", priority: "high", due_on: "2026-12-01" } }, as: :json
    end

    assert_response :created
    assert_equal "high", response.parsed_body["priority"]
    assert_equal "2026-12-01", response.parsed_body["due_on"]
  end

  test "create returns validation errors" do
    post api_tasks_path, params: { task: { title: "" } }, as: :json

    assert_response :unprocessable_content
    assert_equal [ "can't be blank" ], response.parsed_body.dig("errors", "title")
  end

  test "update changes the task" do
    patch api_task_path(tasks(:groceries)), params: { task: { title: "Buy fruit" } }, as: :json

    assert_response :success
    assert_equal "Buy fruit", tasks(:groceries).reload.title
  end

  test "update rejects an unknown priority" do
    patch api_task_path(tasks(:groceries)), params: { task: { priority: "urgent" } }, as: :json

    assert_response :unprocessable_content
  end

  test "cannot touch another user's task" do
    patch api_task_path(tasks(:someone_elses)), params: { task: { title: "Hacked" } }, as: :json

    assert_response :not_found
    assert_equal "Someone else's task", tasks(:someone_elses).reload.title
  end

  test "destroy deletes the task" do
    assert_difference -> { Task.count }, -1 do
      delete api_task_path(tasks(:groceries)), as: :json
    end

    assert_response :no_content
  end

  test "complete marks the task completed" do
    patch complete_api_task_path(tasks(:groceries)), as: :json

    assert_response :success
    assert_not_nil response.parsed_body["completed_at"]
    assert_predicate tasks(:groceries).reload, :completed?
  end

  test "reopen marks the task pending again" do
    patch reopen_api_task_path(tasks(:taxes)), as: :json

    assert_response :success
    assert_nil response.parsed_body["completed_at"]
  end

  private
    def titles
      response.parsed_body["tasks"].pluck("title")
    end
end
