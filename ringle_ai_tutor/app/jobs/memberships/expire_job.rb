module Memberships
  class ExpireJob < ApplicationJob
    queue_as :default

    def perform
      UserMembership.expire_overdue!
    end
  end
end
