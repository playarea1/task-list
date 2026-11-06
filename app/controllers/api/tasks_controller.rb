module Api
  class TasksController < BaseController
    before_action :set_task, only: %i[update destroy complete reopen]

    def index
      tasks = Current.user.tasks.with_status(params[:status]).order(created_at: :desc)

      render json: { tasks: tasks.map { |task| task_json(task) }, counts: counts }
    end

    def create
      task = Current.user.tasks.new(task_params)

      if task.save
        render json: task_json(task), status: :created
      else
        render json: { errors: task.errors }, status: :unprocessable_content
      end
    end

    def update
      if @task.update(task_params)
        render json: task_json(@task)
      else
        render json: { errors: @task.errors }, status: :unprocessable_content
      end
    end

    def destroy
      @task.destroy!
      head :no_content
    end

    def complete
      @task.complete!
      render json: task_json(@task)
    end

    def reopen
      @task.reopen!
      render json: task_json(@task)
    end

    private
      def set_task
        @task = Current.user.tasks.find(params[:id])
      end

      def task_params
        params.expect(task: %i[title description due_on priority])
      end

      def task_json(task)
        task.as_json(only: %i[id title description priority due_on completed_at created_at])
          .merge("overdue" => task.overdue?)
      end

      def counts
        pending = Current.user.tasks.pending.count
        completed = Current.user.tasks.completed.count

        { all: pending + completed, pending: pending, completed: completed }
      end
  end
end
