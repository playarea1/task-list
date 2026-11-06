class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.references :user, null: false, foreign_key: true, index: false
      t.string :title, null: false
      t.text :description
      t.datetime :completed_at
      t.date :due_on
      t.integer :priority, null: false, default: 1

      t.timestamps
    end
    add_index :tasks, %i[user_id completed_at]
  end
end
