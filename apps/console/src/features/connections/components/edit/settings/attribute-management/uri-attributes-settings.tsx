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

import useUIConfig from "@wso2is/common/src/hooks/use-ui-configs";
import { TestableComponentInterface } from "@wso2is/core/models";
import { Code, Heading, Hint, Message } from "@wso2is/react-components";
import find from "lodash-es/find";
import isEmpty from "lodash-es/isEmpty";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Divider, DropdownProps, Form, Grid } from "semantic-ui-react";
import { ConnectionManagementConstants } from "../../../../constants/connection-constants";
import { ConnectionCommonClaimMappingInterface } from "../../../../models/connection";
import { DropdownOptionsInterface } from "../attribute-settings";

interface AdvanceAttributeSettingsPropsInterface extends TestableComponentInterface {
    dropDownOptions: DropdownOptionsInterface[];
    initialSubjectUri: string;
    initialRoleUri: string;
    /**
     * Controls whether role claim mapping should be rendered or not.
     * If you only want to get subject attribute then you should make
     * this `false`.
     */
    claimMappingOn: boolean;
    /**
     * Specifies if the IdP Attribute Mappings are available.
     */
    isMappingEmpty: boolean;
    updateRole: (roleUri: string) => void;
    updateSubject: (subjectUri: string) => void;
    roleError?: boolean;
    subjectError?: boolean;
    /**
     * Specifies if the component should only be read-only.
     */
    isReadOnly: boolean;
    /**
     * Is the IdP type OIDC
     */
    isOIDC: boolean;
    /**
     * Is the IdP type SAML
     */
    isSaml: boolean;
    /**
     * List of claim mappings.
     */
    selectedClaimMappings?: ConnectionCommonClaimMappingInterface[];
}

export const UriAttributesSettings: FunctionComponent<AdvanceAttributeSettingsPropsInterface> = (
    props: AdvanceAttributeSettingsPropsInterface
): ReactElement => {

    const {
        dropDownOptions,
        initialSubjectUri,
        initialRoleUri,
        claimMappingOn,
        updateRole,
        updateSubject,
        roleError,
        selectedClaimMappings,
        subjectError,
        isReadOnly,
        isMappingEmpty,
        isOIDC,
        isSaml,
        [ "data-testid" ]: testId
    } = props;

    const { t } = useTranslation();
    const { UIConfig } = useUIConfig();

    const [ groupAttribute, setGroupAttribute ] = useState<string>("");

    // Set the initial value of the mapped connection attribute of the organization's roles attribute.
    useEffect(() => {
        if (!selectedClaimMappings || selectedClaimMappings.length === 0) {
            return;
        }

        setGroupAttribute(getGroupAttribute());
    }, [ selectedClaimMappings ]);

    // Set the initial value of the Group Attribute dropdown.
    useEffect(() => {
        // If the initial role uri is not available, then use the group attribute.
        updateRole(initialRoleUri ?? groupAttribute);
    }, [ groupAttribute ]);

    const getGroupAttribute = (): string => {
        if (selectedClaimMappings?.length > 0) {
            const groupAttribute: ConnectionCommonClaimMappingInterface = selectedClaimMappings.find(
                (claimMapping: ConnectionCommonClaimMappingInterface) => {
                    return claimMapping.claim.uri == ConnectionManagementConstants.CLAIM_ROLES;
                }
            );

            return groupAttribute ? groupAttribute.mappedValue : "";
        } else {
            return "";
        }
    };

    const getValidatedInitialValue = (initialValue: string) => {
        return find(
            dropDownOptions,
            (option: DropdownOptionsInterface) => option?.value === initialValue
        ) !== undefined ? initialValue : "";
    };

    return (
        <>
            <Grid.Row>
                <Grid.Column>
                    <Heading as="h4">
                        { t("console:develop.features.authenticationProvider.forms.uriAttributeSettings." +
                            "subject.heading") }
                    </Heading>
                    <Form>
                        <Form.Select
                            fluid
                            options={
                                dropDownOptions.concat(
                                    {
                                        key: "default_subject",
                                        text: t("console:develop.features.authenticationProvider.forms." +
                                            "uriAttributeSettings.subject." +
                                            "placeHolder"),
                                        value: ""
                                    } as DropdownOptionsInterface
                                )
                            }
                            value={ getValidatedInitialValue(initialSubjectUri) }
                            placeholder={ t("console:develop.features.authenticationProvider.forms." +
                                "uriAttributeSettings.subject." +
                                "placeHolder") }
                            onChange={
                                (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
                                    updateSubject(data.value.toString());
                                }
                            }
                            search
                            fullTextSearch={ false }
                            label={ t("console:develop.features.authenticationProvider.forms." +
                                "uriAttributeSettings.subject.label") }
                            data-testid={ `${ testId }-form-element-subject` }
                            error={ subjectError && {
                                content: t("console:develop.features.authenticationProvider" +
                                    ".forms.uriAttributeSettings.subject." +
                                    "validation.empty"),
                                pointing: "above"
                            } }
                            readOnly={ isReadOnly }
                            disabled={ isMappingEmpty }
                        />
                    </Form>
                    <Hint>
                        { isSaml
                            ? (
                                <Trans
                                    i18nKey={
                                        "console:console:develop.features.authenticationProvider.forms" +
                                        ".uriAttributeSettings.subject.hint"
                                    }
                                >
                                The attribute that identifies the user at the enterprise identity provider.
                                When attributes are configured based on the authentication response of this
                                IdP connection, you can use one of them as the subject. Otherwise, the
                                default <Code>saml2:Subject</Code> in the SAML response is used as the
                                subject attribute.
                                </Trans>
                            )
                            : (
                                <Trans
                                    i18nKey={
                                        "console:console:develop.features.idp.forms.uriAttributeSettings" +
                                        ".subject.hint"
                                    }
                                >
                                Specifies the attribute that identifies the user at the identity provider.
                                </Trans>
                            )
                        }
                    </Hint>
                </Grid.Column>
            </Grid.Row>
            {
                UIConfig.useRoleClaimAsGroupClaim && (
                    <>
                        <Divider hidden/>
                        <Grid.Row columns={ 2 }>
                            <Grid.Column>
                                <Heading as="h4">
                                    { t("console:develop.features.authenticationProvider.forms.uriAttributeSettings." +
                                "group.heading") }
                                </Heading>
                                {
                                    (claimMappingOn && !isEmpty(initialRoleUri)) && (
                                        <Form>
                                            <Form.Select
                                                fluid
                                                options={
                                                    dropDownOptions.concat(
                                                        {
                                                            key: "default_subject",
                                                            text: t("console:develop.features.authenticationProvider" +
                                                                ".forms.uriAttributeSettings.group.placeHolder"),
                                                            value: ""
                                                        } as DropdownOptionsInterface
                                                    )
                                                }
                                                value={
                                                    initialRoleUri
                                                        ? getValidatedInitialValue(initialRoleUri)
                                                        : getValidatedInitialValue(groupAttribute)
                                                }
                                                placeholder={ t("console:develop.features.authenticationProvider" +
                                                    ".forms.uriAttributeSettings.group.placeHolder") }
                                                onChange={
                                                    (_event: React.SyntheticEvent<HTMLElement, Event>,
                                                        data: DropdownProps) => {
                                                        updateRole(data.value.toString());
                                                    }
                                                }
                                                search
                                                fullTextSearch={ false }
                                                label={ t("console:develop.features.authenticationProvider.forms." +
                                                    "uriAttributeSettings.group.label") }
                                                data-testid={ `${ testId }-form-element-role` }
                                                error={ roleError && {
                                                    content: t("console:develop.features.authenticationProvider" +
                                                        ".forms.uriAttributeSettings.group.validation.empty"),
                                                    pointing: "above"
                                                } }
                                                disabled={ !claimMappingOn }
                                                readOnly={ isReadOnly }
                                            />
                                            <Hint>
                                                { t("console:develop.features.authenticationProvider." +
                                                    "forms.uriAttributeSettings.group.hint") }
                                            </Hint>
                                        </Form>
                                    )
                                }
                                <Message
                                    hidden={ claimMappingOn && !isEmpty(initialRoleUri)  }
                                    type="info"
                                    content={
                                        (
                                            <Trans
                                                i18nKey={
                                                    "console:develop.features.authenticationProvider." +
                                                        "forms.uriAttributeSettings.group.message"
                                                }
                                                tOptions={ {
                                                    attribute: isOIDC
                                                        ? ConnectionManagementConstants.OIDC_ROLES_CLAIM
                                                        : ConnectionManagementConstants.CLAIM_ROLES
                                                } }
                                            >
                                                Please note that <strong>{ isOIDC
                                                    ? ConnectionManagementConstants.OIDC_ROLES_CLAIM
                                                    : ConnectionManagementConstants.CLAIM_ROLES }</strong>
                                                 attribute will be considered as the default
                                                <strong>Group Attribute</strong> as you have not added a
                                                custom attribute mapping for the connection roles attribute.
                                            </Trans>
                                        )
                                    }
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </>

                )
            }
        </>
    );
};

/**
 * Default proptypes for the IDP uri attribute settings component.
 */
UriAttributesSettings.defaultProps = {
    "data-testid": "idp-edit-attribute-settings-uri-attribute-settings"
};