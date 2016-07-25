/*!
 * Codefolio
 * Copyright(c) 2016 MSMFSD
 * MIT Licensed
 */
/* eslint no-spaced-func: "off" */

/**
 * Helper method to convert custom avatar file stream to base64
 * @param formData - object
 */
export const convertToBase64Async = (formData) => {
  return new Promise ((resolve, reject) => {
    // encoding needed?
    if(formData.use === 'customAvatar' && (formData.customAvatarFile && formData.customAvatarFile[0])) {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => reject({ message: 'Error converting jpeg/png file.' })
      reader.readAsDataURL(formData.customAvatarFile[0])
    } else {
      resolve('null')
    }
  })
}

/**
* Helper method to reformat redux form data to profile state
* Why? Redux-form cannot map nested state props to fields
* See: Bindings on /src/components/admin/EditProfileForm/EditProfileForm.js
* @param formData - object
*/
export const formatProfileData = (formData, base64) => {
  // layout
  formData.layout = {
    theme: formData.theme,
    displayBgImage: formData.displayBgImage
  }
  // avatar
  let customAvatarFilename
  if(base64 !== 'null') {
    customAvatarFilename = base64
  }
  formData.avatar = {
    use: formData.use,
    gravitarEmail: formData.gravitarEmail,
    customAvatar: customAvatarFilename
  }
  // clean up object
  delete formData.theme
  delete formData.displayBgImage
  delete formData.use
  delete formData.gravitarEmail
  delete formData.customAvatar
  delete formData.customAvatarFile
  delete formData.defaultAvatar
  return formData
}
