var users_service = require('mount-services')(__dirname).todos_service;

// -- custom api
exports.api = {
  login: function (req, res, next) {
    // var user_id = req.api_user._id;
    
    var is_valid = users_service.login_valid('sang', '000000');
    
    if(is_valid == true){
      return res.api(200,{
      	a:'login true'
      });
    }else{
      return res.api(200,{
      	a:'login false '
      });
    }
  },
  show: function (req, res, next) {
    var user_id = req.api_user._id;
    var id = req.params.user_id;
    
    User.getById(id, function (err, user) {
      if (err) {
        return res.api_error(err);
      }
      
      res.api({
        user : user
      });
    }); 
  }
}