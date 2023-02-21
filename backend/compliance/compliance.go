package compliance

import "github.com/Zeus-Labs/ZeusCloud/rules/types"

type ComplianceFrameworkSpec struct {
	FrameworkName               string
	ComplianceControlGroupSpecs []ComplianceControlGroupSpec
}

type ComplianceControlGroupSpec struct {
	GroupName              string
	ComplianceControlSpecs []ComplianceControlSpec
}

type ComplianceControlSpec struct {
	ControlName    string
	ZeusCloudRules []types.Rule
	Comment        string
}

var FrameworkIDToSpec = map[string]ComplianceFrameworkSpec{
	"cis_1_2_0":     Cis_1_2_0_Spec,
	"cis_1_3_0":     Cis_1_3_0_Spec,
	"cis_1_4_0":     Cis_1_4_0_Spec,
	"cis_1_5_0":     Cis_1_5_0_Spec,
	"pci_dss_3_2_1": Pci_dss_3_2_1_Spec,
}
