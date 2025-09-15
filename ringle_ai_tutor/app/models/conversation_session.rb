class ConversationSession < ApplicationRecord
  belongs_to :user
  enum :status, { active: 0, ended: 1 }

  validates :session_id, presence: true, uniqueness: true
  validates :started_at, presence: true

  before_create :ensure_logs_initialized

  def add_turn(role:, content:)
    self.logs ||= {}
    self.logs['turns'] = Array(self.logs['turns'])
    self.logs['turns'] << {
      'role'    => role,
      'content' => content,
      'ts'      => Time.current.iso8601(6)
    }
    save!
  end

  def end!
    update!(status: :ended, ended_at: Time.current)
  end

  private

  def ensure_logs_initialized
    self.logs ||= {}
    self.logs['turns'] = Array(self.logs['turns'])
  end
end
