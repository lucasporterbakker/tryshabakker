class API::V1::RestaurantsController < API::V1::BaseController

  def index
    @restaurants = Restaurant.all
  end

end
