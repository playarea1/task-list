class Task < ApplicationRecord
  belongs_to :user

  enum :priority, { low: 0, medium: 1, high: 2 }, validate: true

  validates :title, presence: true, length: { maximum: 200 }

  scope :pending, -> { where(completed_at: nil) }
  scope :completed, -> { where.not(completed_at: nil) }

  def self.with_status(status)
    case status.to_s
    when "pending" then pending
    when "completed" then completed
    else all
    end
  end

  def completed?
    completed_at.present?
  end

  def complete!
    update!(completed_at: Time.current) unless completed?
  end

  def reopen!
    update!(completed_at: nil)
  end

  def overdue?
    due_on.present? && !completed? && due_on.past?
  end
end
