const iflogged=async(req,res,next)=>{
    if(req.session.isAuth){
      res.redirect('/')
    }else{
      next()
    }
  }
  const islogged=async(req,res,next)=>{
    if(req.session.isAuth){
      req.user=req.session.user;
      next()
    }else{
      res.redirect('/profile')
    }
  }
  
  const loggedout=async(req,res,next)=>{
    if(req.session.user){
      next()
    }else{
      res.redirect('/')
    }
  }
  
  const checkSessionVariable = (variableName,redirectPath) => {
      return (req, res, next) => {
        
        if (req.session[variableName]) {
  
          next();
        } else {
        
          res.redirect(redirectPath);
        }
      };
    };
    const loggedadmin=(req,res,next)=>{
      if(req.session.isadAuth){
        next()
      }
      else{
        res.redirect('/admin')
      }
    }

    const logoutadmin= (req,res,next)=>{
      if(!req.session.isadAuth){
        next()
      }
      else{
        res.redirect('/admin/adminpannel')
      }
    }
    const logouting =(req,res,next)=>{
      req.session.destroy();
      res.redirect('/admin')
    }
  

    module.exports={
        iflogged,
        islogged,
        loggedout,
        checkSessionVariable,
        loggedadmin,
        logoutadmin,
        logouting
        
    }