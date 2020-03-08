json.restaurants do
  json.array! @restaurants do |restaurant|
    json.extract! restaurant, :id, :name, :address, :image, :description
  end
end
