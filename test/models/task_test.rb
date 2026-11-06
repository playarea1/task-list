require "test_helper"

class TaskTest < ActiveSupport::TestCase
  test "requires a title" do
    task = Task.new(user: users(:one), title: " ")

    assert_not task.valid?
    assert_includes task.errors[:title], "can't be blank"
  end

  test "limits the title to 200 characters" do
    task = Task.new(user: users(:one), title: "a" * 201)

    assert_not task.valid?
  end

  test "defaults to medium priority" do
    assert_predicate Task.new, :medium?
  end

  test "rejects an unknown priority" do
    task = Task.new(user: users(:one), title: "Call mom", priority: "urgent")

    assert_not task.valid?
    assert_includes task.errors[:priority], "is not included in the list"
  end

  test "filters by status" do
    user_tasks = users(:one).tasks

    assert_equal [ tasks(:groceries) ], user_tasks.with_status("pending").to_a
    assert_equal [ tasks(:taxes) ], user_tasks.with_status("completed").to_a
    assert_equal 2, user_tasks.with_status("all").count
  end

  test "treats an unknown status as all" do
    assert_equal 2, users(:one).tasks.with_status("bogus").count
  end

  test "complete! stamps completed_at" do
    task = tasks(:groceries)

    task.complete!

    assert_predicate task.reload, :completed?
  end

  test "complete! keeps the original completion time" do
    task = tasks(:taxes)

    assert_no_changes -> { task.reload.completed_at } do
      task.complete!
    end
  end

  test "reopen! clears completed_at" do
    task = tasks(:taxes)

    task.reopen!

    assert_not task.reload.completed?
  end

  test "is overdue only when pending and past its due date" do
    assert_predicate Task.new(due_on: Date.yesterday), :overdue?
    assert_not Task.new(due_on: Date.current).overdue?
    assert_not Task.new(due_on: Date.yesterday, completed_at: Time.current).overdue?
    assert_not Task.new.overdue?
  end
end
