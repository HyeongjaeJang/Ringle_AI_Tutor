class CreateMembershipPlans < ActiveRecord::Migration[8.0]
  def change
    create_table :membership_plans do |t|
      t.string  :name, null: false
      t.integer :duration_days, null: false
      t.string  :features, array: true, default: [], null: false
      t.integer :price_cents, default: 0, null: false
      t.timestamps
    end
  end
end
