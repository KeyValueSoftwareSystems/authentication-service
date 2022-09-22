import { Link, Outlet, Navigate } from "react-router-dom"
import CustomerAuth from "../../services/auth";

const HomePage = () => {
  return (
    <>
      <nav>
        <ul>
          <li><Link to='/home/users'>USERS</Link></li>
          <li><Link to='/home/groups'>GROUPS</Link></li>
          <li><Link to='/home/roles'>ROLES</Link></li>
          <li><Link to='/home/permissions'>PERMISSIONS</Link></li>

        </ul>
      </nav>

      {CustomerAuth?.isAuthenticated ? <Outlet /> : <Navigate replace to='/login'/>}
    </>
  )
}

export default HomePage;