class CreateCoupons < ActiveRecord::Migration[8.0]
  def change
    create_table :coupons do |t|
      t.references :user, null: false, foreign_key: true
      t.string :kind
      t.integer :remaining_uses
      t.datetime :expires_at

      t.timestamps
    end
  end
end
