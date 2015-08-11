package tasks.grails.master

class CategoriaController {
	static scaffold = true
	

	def list(){
		render(contentType: "text/json") {
			Categoria.findAll()
		}
	}

}



