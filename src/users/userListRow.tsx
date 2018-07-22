import * as React from 'react';
import { IUser } from './queries';

interface IUserListRowProps {
  user: IUser;
  editUser: (id: string) => void;
  deleteUser: (id: string) => void;
}

export default class UserListRow extends React.Component<IUserListRowProps> {
  public render() {
    return (
      <tr onClick={this.editUser}>
        <td>{this.props.user.firstname}</td>
        <td>{this.props.user.lastname}</td>
        <td>
          <button onClick={this.deleteUser}>
            <span className="fa fa-times"/>
          </button>
        </td>
      </tr>
    );
  }
  private editUser = () => {
    this.props.editUser(this.props.user.id);
  }
  private deleteUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    this.props.deleteUser(this.props.user.id);
  }
}
