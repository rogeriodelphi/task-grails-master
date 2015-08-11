tasksController = function() {
	
	function errorLogger(errorCode, errorMessage) {
		console.log(errorCode +':'+ errorMessage);
	}
	
	var taskPage;
	var initialised = false;   
	
	return {		
		init : function(page, callback) {
			if (initialised) {
				callback()
			} else {
				if(!initialised) {
					taskPage = page;
					storageEngine.init(function() {
						storageEngine.initObjectStore('task', function() {
							callback();
						}, errorLogger) 
					}, errorLogger);
				
				$(taskPage).find( '[required="required"]' ).prev('label').append( '<span>*</span>').children( 'span').addClass('required');
				
				$(taskPage).find('tbody tr:even').addClass( 'even');
				
				$(taskPage).find( '#btnAddTask' ).click( function(evt) {
					evt.preventDefault();
					$(taskPage ).find('#taskCreation' ).removeClass( 'not');
				});
				
				$(taskPage).find('tbody tr' ).click(function(evt) {
					$(evt.target ).closest('td').siblings( ).andSelf( ).toggleClass( 'rowHighlight');
				});
				
				$(taskPage).find('#tblTasks tbody').on('click', '.deleteRow', 
				function(evt) { 									
					storageEngine.delete('task', $(evt.target).data().taskId, 
					function() {
						$(evt.target).parents('tr').remove(); 
						//aqui limpa a lista e roda o loadTask novame
						$(taskPage).find('#tblTasks tbody').empty();
						tasksController.loadTasks();
					}, errorLogger);
				});		
				
				$(taskPage).find('#tblTasks tbody').on('click', '.completedRow', 
				function(evt) { 					
					storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
						task.completed = 1;									
						storageEngine.save('task', task, function() {
							$(taskPage).find('#tblTasks tbody').empty();
							tasksController.loadTasks();
							$(':input').val('');
							$(taskPage).find('#taskCreation').addClass('not');
						}, errorLogger);
					}, errorLogger);
				});	
				
				$(taskPage).find('#tblTasks tbody').on('click', '.editRow', 
				function(evt) { 
					$(taskPage).find('#taskCreation').removeClass('not');
					storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
						$(taskPage).find('form').fromObject(task);
					}, errorLogger);
				}
				);
				
				//Percorre o form reseta os campos
				$(taskPage).find('#clearTask').click(function(evt) {
					evt.preventDefault();
					$('#taskForm').each (function(){
						this.reset();	
					});
				});
				
				$(taskPage).find('#saveTask').click(function(evt) {
					evt.preventDefault();
					if ($(taskPage).find('form').valid()) {
						var task = $(taskPage).find('form').toObject();		
						storageEngine.save('task', task, function() {
							$(taskPage).find('#tblTasks tbody').empty();
							tasksController.loadTasks();
							$(':input').val('');
							$(taskPage).find('#taskCreation').addClass('not');
						}, errorLogger);
					}
				});
				initialised = true;
				}
			}
    	},
		loadTasks : function() {
			storageEngine.findAll('task', 
			function(tasks) {
				//Ordena a lista por data
				tasks.sort(function(a, b){
				if (a.requiredBy < b.requiredBy)
					return -1;
				if (a.requiredBy > b.requiredBy)
					return 1;
				return 0;
				});
				var i = 0;
				$.each(tasks, function(index, task) {
					$('#taskRow').tmpl(task ).appendTo( $(taskPage ).find( '#tblTasks tbody'));
					//Utilizo o datejs.com para comparar as datas
					var classId = "#"+task.id;
					switch (Date.today().compareTo(Date.parse(task.requiredBy))) {
						case 1: //caso a tenha passado do prazo
							$(classId).addClass('overdue');
							break;
						case 0: //caso a tarefa esteja próxima do prazo
							$(classId).addClass('warning');
							break;
					}
					// Conta somente as tarefas não completadas
					if (task.completed){
						$(classId).addClass('taskCompleted'); //adicionando classe 
						$(classId + ' .editRow').hide(); //esconde o boão "Editar"
						$(classId + ' .completedRow').hide(); //esconde o botão "Completar"
					} else {
						i++; 
					}
				});
				//contador
				$('#taskCount').append(i);
			}, 
			errorLogger);
		}
	}
}();