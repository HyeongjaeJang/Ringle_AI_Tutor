class Api::V1::ConversationSessionsController < ApplicationController
  before_action :authenticate_user!
  before_action :find_session!, only: [:update, :end_session]

  def create
    ChatGatekeeper.authorize_and_maybe_redeem!(user: current_user)
    
    session = ConversationSession.create!(
      user: current_user,
      session_id: SecureRandom.uuid,
      started_at: Time.current,
      status: :active,
      logs: { 'turns' => [] }
    )
    
    render_ok({
      id: session.id,
      session_id: session.session_id,
      allowed: true,
      status: session.status,
      started_at: session.started_at
    }, status: :ok)
  rescue ChatGatekeeper::Forbidden => e
    render json: { 
      allowed: false, 
      reason: e.message,
      error: e.message
    }, status: :forbidden
  end

  def update
    return unless validate_turn_params!
    
    @session.add_turn(role: params[:role], content: params[:content])
    @session.reload

    logs = @session.logs || {}
    turns = logs.is_a?(Hash) ? (logs['turns'] || logs[:turns]) : nil
    turns = Array(turns)
    logs_out = logs.merge('turns' => turns)

    
    render_ok({
      session_id: @session.session_id,
      turns: turns,
      logs: logs_out,
      turn_count: turns.count
    })
  rescue StandardError => e
    render_error("Failed to add turn: #{e.message}")
  end

def end_session
    now = Time.current

    @session.ended_at ||= now

    if @session.respond_to?(:status)
      @session.status = :ended if @session.status.to_s != "ended"
    end

    @session.logs ||= {}
    @session.logs["summary"] = params[:summary].to_s if params[:summary].present?

    @session.save!

    turns = Array(
      (@session.logs.is_a?(Hash) && (@session.logs["turns"] || @session.logs[:turns])) || []
    )

    duration =
      if @session.started_at && @session.ended_at
        (@session.ended_at - @session.started_at).to_i
      else
        0
      end

    render_ok({
      id: @session.id,
      session_id: @session.session_id,
      status: @session.status,
      ended_at: @session.ended_at,
      duration_seconds: duration,
      turns: turns,
      logs: @session.logs,
      turn_count: turns.size
    })
  rescue => e
    render_error("Failed to end session: #{e.message}")
  end

  private

  def find_session!
    raw = params[:id].to_s.presence || params[:session_id].to_s
    @session =
      ConversationSession.find_by(id: raw) ||
      ConversationSession.find_by(session_id: raw)

    return if @session.present?

    render_error("Session not found", status: :not_found)
  end

  def set_session
    @session = ConversationSession.find_by!(session_id: params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error("Session not found", status: :not_found)
  end

  def validate_turn_params!
    unless params[:role].present? && params[:content].present?
      render_error("Both role and content are required", status: :unprocessable_content)
      return false
    end
    
    unless %w[user assistant].include?(params[:role])
      render_error("Role must be 'user' or 'assistant'", status: :unprocessable_content)
      return false
    end
    
    true
  end
end
