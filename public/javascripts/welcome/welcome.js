// angular stuff
// login and registration controllers
// this is used via ng-app="welcome" on #container in index.jade
//
// data.isValid, errorHappened, irRegistered, userNotFound are jsons returned by people.js
// they are returned with HTTP status codes
var app = angular.module("welcome", []);

// login controller
app.controller("sign_in", function($scope, $http){
    $scope.login = function(){
    	if($("#emailpseudoinput_login").val() /*has to be jQuery*/ == undefined || $scope.wp_login == undefined){
    		printError("please fill all fields.");
    	}else if($scope.wp_login.length < 6){
    		printError("password is invalid.");
    	}else{
    		var request = $http({
    			method: "post",
    			url: "/people/login",
			    data: {
			        vale: $("#emailpseudoinput_login").val() /*has to be jQuery, so that the username from pseudolookup_input gets recognised as text*/,
			        valp: $scope.wp_login
			    }
		    });
		    
		    /* Check whether the HTTP Request is successful or not. */
			request.success(function(data){

				var uname;
			    if(data.isValid){

			    	// get username and save it for later use
			    	$.ajax({
						type: "post",
						url: "/people/pseudolookup",
						data: { valuid: window.sessionStorage.getItem("ping_uid") },
						success: function(data){
							if(data.pseudoforid != undefined){
								if(window.localStorage.getItem("ping_pseudo") != undefined ||
									window.sessionStorage.getItem("ping_pseudo") != undefined){
									window.localStorage.removeItem("ping_pseudo");
									window.sessionStorage.removeItem("ping_pseudo");
								}
								if($("#checkbox_saveuname").is(":checked")){
									window.localStorage.setItem("ping_pseudo", data.pseudoforid);
									window.sessionStorage.setItem("ping_pseudo", data.pseudoforid);
								}else{
									window.sessionStorage.setItem("ping_pseudo", data.pseudoforid);
								}
							}else{
								printError("couldn't get username. error.")
							}
						},error: function(data){
							if(data.errorHappened){
								printError("there was an internal server error.");
							}else if(data.userNotFound){
								console.log("there was no user with that id.");
							}
						}
					});

			    	if($("#checkbox_saveuname").is(":checked")){
			    		// store user data as permanent
			    		if(window.localStorage.getItem("ping_uid") != undefined ||
			    		 window.localStorage.getItem("ping_uid") != undefined){
							window.localStorage.removeItem("ping_uid");
							window.sessionStorage.removeItem("ping_uid");
						}
						window.localStorage.setItem("ping_uid", data.valu);
						window.sessionStorage.setItem("ping_uid", data.valu);
			    	}else{
			    		// store user data as session lifetime 
						if(window.localStorage.getItem("ping_uid") != undefined ||
			    		 window.localStorage.getItem("ping_uid") != undefined){
							window.localStorage.removeItem("ping_uid");
							window.sessionStorage.removeItem("ping_uid");
						}
			    		window.sessionStorage.setItem("ping_uid", data.valu);
			    	}
					window.location = "/home";
				}
			});

			request.error(function(data){
				console.log("LOGIN ERROR");
				if(data.userNotFound){
					printError("there is no user with this email/pseudonym.");
					goto_reg();
				}else if(!data.isValid){
					$("#pwinput_login").val("");
					$("#pwinput_login").focus();
					printError("password is invalid.");
				}else if(data.errorHappened){
					printError("error at login.");
				}
			});
		}
	}
});


// registration controller
app.controller("sign_up", function($scope, $http){
	$scope.register = function(){
		if($scope.email_reg == undefined ||
			$scope.name_reg == undefined || 
			$scope.wp_reg == undefined || 
			$scope.wpr_reg == undefined){
			printError('please fill all fields.')
		}else if(!checkIfEmailInString /*method in misc.js*/($scope.email_reg)){
			printError('the email address you entered is not valid.');
			$("#emailinput_reg").focus();
		}else if($scope.name_reg.length < 4){
			printError('the name you entered was not long enough.');
			$("#nameinput_reg").focus();
		}else if($scope.wp_reg.length < 6){
			printError('the password you entered was not long enough.');
			$("#pwinput_reg").val("");
			$("#pwrinput_reg").val("");
			$("#pwinput_reg").focus();
		}else if($scope.wp_reg != $scope.wpr_reg){
			printError('the passwords you entered do not match.');
			$("#pwinput_reg").val("");
			$("#pwrinput_reg").val("");
			$("#pwinput_reg").focus();
		}else{
			var request = $http({
    			method: "post",
    			url: "/people/new",
			    data: {
			        vale: $scope.email_reg,
			        valn: $scope.name_reg,
			        valps: $scope.pseudo_reg,
			        valp: $scope.wp_reg
			    }
		    });

		    /* Check whether the HTTP Request is successful or not. */
			request.success(function(data){
				if(data.isRegistered){
					window.location = "/";
					
					// remove current entries from browser storage
					if(window.localStorage.getItem("ping_uid") != undefined || window.localStorage.getItem("ping_uid") != undefined){
						window.localStorage.removeItem("ping_uid");
						window.sessionStorage.removeItem("ping_uid");
					}
				}
			});

			request.error(function(data){
				console.log("REGISTRATION ERROR");
				if(data.emailandpseudoInUse){
					printError("the email as well as the pseudonym you entered are both in use.");
				}else if(data.emailInUse){
					printError("email already in use.");
				}else if(data.pseudonymInUse){
					printError("pseudonym already in use");
				}else if(data.errorHappened){
					printError("ERROR AT REGISTRATION");
				}
			});
		}
	}
});

function pseudolookup_insert_uname(uid){
	$.ajax({
		type: "post",
		url: "/people/pseudolookup",
		data: { valuid: uid },
		success: function(data){
			if(data.pseudoforid != undefined){
				// set pseudonym in login field
				$("#emailpseudoinput_login").val(data.pseudoforid);
				$("#pwinput_login").focus();
				if(window.localStorage.getItem("ping_uid") != undefined){
					$("#checkbox_saveuname").prop("checked", true);
				}
			}else{
				$("#emailpseudoinput_login").val("");
			}
		},error: function(data){
			if(data.errorHappened){
				printError("there was an internal server error.");
			}else if(data.userNotFound){
				console.log("there was no user with that id.");
			}
		}
	});
}

// launching welcome page
// -animate the background
// -set click and keypress listeners
// -hide register panel
// -get username/uid from local/session storage
function welcome_start(){
	//var dg_H = screen.height;
	//var dg_W = screen.width;
	$('#bgcontainer img.bgfade').hide();
    $('#bgcontainer').css({'height':'120%','width':'100%'});
	anim();
	$(window).resize(function(){window.location.href=window.location.href})
	set_welcome_click_listeners();
	set_welcome_keypress_listeners();
	$("#registerpanel").hide();
	$("#emailpseudoinput_login").focus();

  	// if there is a uid stored in the browser
  	// get it, send it to the server and fetch the user pseudonym
	if(window.sessionStorage.getItem("ping_uid") != undefined){
		pseudolookup_insert_uname(window.sessionStorage.getItem("ping_uid"));
	}else if(window.localStorage.getItem("ping_uid") != undefined){
		pseudolookup_insert_uname(window.localStorage.getItem("ping_uid"));
	}else{
		console.log("no uid and no username found.");
	}
}

// all click listeners for the welcome page
// for the "links" to change the forms between login and register
// for the registration and login button
function set_welcome_click_listeners(){
	$("#gotoreg_login").bind("click", function () {
		goto_reg();
	});

	$("#gotologin_reg").bind("click", function () {
		goto_login();
	});
}

// used to store the username 
// when switching back from registration to login
var temp_uname; 

function goto_reg(){
	temp_uname = $("#emailpseudoinput_login").val();
	$(":input").val("");
	$("#regbutton_reg").val("Create my account");
	$(".registerpanel").addClass("active");
	$(".loginpanel").removeClass("active");
	$(".loginpanel").hide();
	$(".registerpanel").show();
	$("#emailinput_reg").focus();
}

function goto_login(){
	$(":input").val("");
	$("#emailpseudoinput_login").val(temp_uname);
	$("#loginbutton_login").val("Log in");
	$(".loginpanel").addClass("active");
	$(".registerpanel").removeClass("active");
	$(".registerpanel").hide();
	$(".loginpanel").show();
	$("#emailpseudoinput_login").focus();
}

// listen for enter on the inputs
function set_welcome_keypress_listeners(){
	$(".login").bind("keypress", function (e) {
	    var key = e.which || e.keyCode;
	    if (key == 13) { // 13 is enter
	    	$("#loginbutton_login").click();
	    }
	});

	$(".reg").bind("keypress", function (e) {
	    var key = e.which || e.keyCode;
	    if (key == 13) { // 13 is enter
	    	$("#regbutton_reg").click();
	    }
	});
}
