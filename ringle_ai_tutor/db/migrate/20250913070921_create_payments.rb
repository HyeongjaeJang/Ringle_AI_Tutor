class CreatePayments < ActiveRecord::Migration[7.2]
  def change
    create_table :payments do |t|
      t.references :user, null: false, foreign_key: true
      t.references :membership_plan, null: false, foreign_key: true
      t.integer :amount_cents, null: false, default: 0
      t.string  :currency, null: false, default: "KRW"
      t.string  :provider, null: false, default: "mock"
      t.string  :provider_txn_id, null: false
      t.integer :status, null: false, default: 0
      t.jsonb   :metadata, null: false, default: {}
      t.datetime :issued_at, null: false
      t.timestamps
    end
    add_index :payments, :provider_txn_id, unique: true
    add_index :payments, :status
  end
end
