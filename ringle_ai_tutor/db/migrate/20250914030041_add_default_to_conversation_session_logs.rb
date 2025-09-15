class AddDefaultToConversationSessionLogs < ActiveRecord::Migration[8.0]
  def change
    change_column_default :conversation_sessions, :logs, from: nil, to: {}
  end
end
