package tasks.grails.master



import static org.springframework.http.HttpStatus.*
import grails.transaction.Transactional

@Transactional(readOnly = true)
class TasksController {

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond Tasks.list(params), model:[tasksInstanceCount: Tasks.count()]
    }

    def show(Tasks tasksInstance) {
        respond tasksInstance
    }

    def create() {
        respond new Tasks(params)
    }

    @Transactional
    def save(Tasks tasksInstance) {
        if (tasksInstance == null) {
            notFound()
            return
        }

        if (tasksInstance.hasErrors()) {
            respond tasksInstance.errors, view:'create'
            return
        }

        tasksInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'tasks.label', default: 'Tasks'), tasksInstance.id])
                redirect tasksInstance
            }
            '*' { respond tasksInstance, [status: CREATED] }
        }
    }

    def edit(Tasks tasksInstance) {
        respond tasksInstance
    }

    @Transactional
    def update(Tasks tasksInstance) {
        if (tasksInstance == null) {
            notFound()
            return
        }

        if (tasksInstance.hasErrors()) {
            respond tasksInstance.errors, view:'edit'
            return
        }

        tasksInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'Tasks.label', default: 'Tasks'), tasksInstance.id])
                redirect tasksInstance
            }
            '*'{ respond tasksInstance, [status: OK] }
        }
    }

    @Transactional
    def delete(Tasks tasksInstance) {

        if (tasksInstance == null) {
            notFound()
            return
        }

        tasksInstance.delete flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'Tasks.label', default: 'Tasks'), tasksInstance.id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'tasks.label', default: 'Tasks'), params.id])
                redirect action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
