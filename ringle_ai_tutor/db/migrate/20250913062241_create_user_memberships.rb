class CreateUserMemberships < ActiveRecord::Migration[8.0]
  def change
    create_table :user_memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :membership_plan, null: false, foreign_key: true
      t.datetime :starts_at
      t.datetime :ends_at
      t.integer :status
      t.string :assigned_by

      t.timestamps
    end
  end
end
