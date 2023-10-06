/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { ProfileInfoInterface } from "@wso2is/core/models";
import { User } from "./models";
import { deleteUser } from "../../features/users/api/users";
import { deleteGuestUser } from "../components/users/api";
import { CONSUMER_USERSTORE } from "../components/users/constants";

export const userConfig: User = {
    bulkUserImportLimit: {
        fileSize: 500,
        userCount: 100
    },
    deleteUser: (user: ProfileInfoInterface): Promise<any> => {
        if (user.userName?.split("/")[0] === CONSUMER_USERSTORE) {
            return deleteUser(user.id);
        } else {
            return deleteGuestUser(user.id);
        }
    },
    showBulkUserImportOption: true
};
