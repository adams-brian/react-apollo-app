import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import EditUser from './editUser';
import UserList from './userList';

export default function Users() {
  return (
    <Switch>
      <Route exact={true} path="/users" component={UserList}/>
      {/* <Route exact={true} path="/users/createuser" component={EditUser}/> */}
      <Route path="/users/:id" component={EditUser}/>
    </Switch>
  );
}
