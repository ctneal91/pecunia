module Api
  module V1
    class ExportsController < ApplicationController
      before_action :authenticate_user!

      def goals
        export_service = ExportService.new(current_user)

        case params[:format]
        when "csv"
          send_data export_service.goals_csv, filename: "goals-#{Date.current}.csv", type: "text/csv"
        else
          render json: { data: export_service.goals_json }
        end
      end

      def contributions
        export_service = ExportService.new(current_user)
        goal_id = params[:goal_id].presence

        case params[:format]
        when "csv"
          filename = goal_id ? "goal-#{goal_id}-contributions-#{Date.current}.csv" : "contributions-#{Date.current}.csv"
          send_data export_service.contributions_csv(goal_id), filename: filename, type: "text/csv"
        else
          render json: { data: export_service.contributions_json(goal_id) }
        end
      end

      def summary
        export_service = ExportService.new(current_user)
        render json: export_service.summary_report
      end

      def goal_report
        export_service = ExportService.new(current_user)
        render json: export_service.goal_report(params[:goal_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Goal not found" }, status: :not_found
      end
    end
  end
end
