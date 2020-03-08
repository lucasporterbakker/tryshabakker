class CreateComments < ActiveRecord::Migration[5.1]
  def change
    create_table :comments do |t|
      t.string :name
      t.string :image
      t.string :content
      t.reference :restaurant

      t.timestamps
    end
  end
end
