class CreateConversationSession < ActiveRecord::Migration[8.0]
  def change
    create_table :conversation_sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.string  :session_id, null: false
      t.datetime :started_at, null: false
      t.datetime :ended_at
      t.integer :status, null: false, default: 0
      t.jsonb   :logs, null: false, default: {} # {"turns":[{role:"user/ai", content:"..."}]}

      t.timestamps
    end
    add_index :conversation_sessions, :session_id, unique: true
  end
end
