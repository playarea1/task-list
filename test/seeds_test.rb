require "test_helper"

class SeedsTest < ActiveSupport::TestCase
  test "creates the demo user with sample tasks and is safe to run twice" do
    2.times { Rails.application.load_seed }

    demo = User.find_by!(email_address: User::DEMO_EMAIL)
    assert_equal 5, demo.tasks.count
    assert demo.authenticate(User::DEMO_PASSWORD)
  end
end
