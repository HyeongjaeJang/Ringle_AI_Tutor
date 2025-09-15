namespace :memberships do
  desc "Expire memberships whose ends_at is past (set status=expired)"
  task expire: :environment do
    result = Memberships::ExpireJob.perform_now
    puts "Expired memberships: #{result}"
  end
end
