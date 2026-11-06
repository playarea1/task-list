require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "downcases and strips email_address" do
    user = User.new(email_address: " DOWNCASED@EXAMPLE.COM ")
    assert_equal("downcased@example.com", user.email_address)
  end

  test "requires a unique email address regardless of case" do
    user = User.new(email_address: "ONE@example.com", password: "long-enough")

    assert_not user.valid?
    assert_includes user.errors[:email_address], "has already been taken"
  end

  test "rejects a malformed email address" do
    user = User.new(email_address: "not-an-email", password: "long-enough")

    assert_not user.valid?
    assert_includes user.errors[:email_address], "is invalid"
  end

  test "requires a password of at least 8 characters" do
    user = User.new(email_address: "new@example.com", password: "short")

    assert_not user.valid?
    assert_includes user.errors[:password], "is too short (minimum is 8 characters)"
  end

  test "deletes its tasks when destroyed" do
    assert_difference -> { Task.count }, -2 do
      users(:one).destroy
    end
  end
end
